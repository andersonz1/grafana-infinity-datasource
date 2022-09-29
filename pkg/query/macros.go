package query

import (
	"errors"
	"fmt"
	"regexp"
	"strings"

	"github.com/andersonz1/grafana-plugin-sdk-go/backend"
	"github.com/andersonz1/grafana-plugin-sdk-go/backend/gtime"
)

type macroFunc func(string, []string) (string, error)

func getMatches(macroName, input string) ([][]string, error) {
	macroRegex := fmt.Sprintf("\\$__%s\\b(?:\\((.*?)\\))?", macroName)
	rgx, err := regexp.Compile(macroRegex)
	if err != nil {
		return nil, err
	}
	return rgx.FindAllStringSubmatch(input, -1), nil
}

func escapeKeywords(input string) string {
	input = strings.ReplaceAll(input, "__comma", ",")
	input = strings.ReplaceAll(input, "__space", " ")
	input = strings.ReplaceAll(input, "__open", "(")
	input = strings.ReplaceAll(input, "__close", ")")
	return input
}

// InterPolateMacros interpolate macros on a given string
func InterPolateMacros(queryString string, timeRange backend.TimeRange) (string, error) {
	timeRangeInMilliSeconds := timeRange.To.UnixMilli() - timeRange.From.UnixMilli()
	macros := map[string]macroFunc{
		"combineValues": func(query string, args []string) (string, error) {
			if len(args) <= 3 {
				return query, errors.New("insufficient arguments to combineValues macro")
			}
			if len(args) == 4 && args[3] == "*" {
				return "", nil
			}
			outs := []string{}
			prefix := escapeKeywords(args[0])
			suffix := escapeKeywords(args[1])
			joinBy := escapeKeywords(args[2])
			for idx, arg := range args {
				if idx <= 2 {
					continue
				}
				outs = append(outs, fmt.Sprintf("%s%s%s", prefix, arg, suffix))
			}
			return strings.Join(outs, joinBy), nil
		},
		"customInterval": func(query string, args []string) (string, error) {
			if len(args) == 0 {
				return query, errors.New("insufficient arguments to customInterval macro")
			}
			for argI := range args {
				if argI == len(args)-1 {
					return args[argI], nil
				}
				if argI%2 != 0 {
					duration, err := gtime.ParseDuration(args[argI-1])
					if err != nil {
						return query, errors.New("invalid customInterval macro")
					}
					if timeRangeInMilliSeconds <= duration.Milliseconds() {
						return args[argI], nil
					}
				}
			}
			return query, nil
		},
	}
	for key, macro := range macros {
		matches, err := getMatches(key, queryString)
		if err != nil {
			return queryString, err
		}
		for _, match := range matches {
			if len(match) == 0 {
				continue
			}
			args := []string{}
			if len(match) > 1 {
				args = strings.Split(match[1], ",")
			}
			res, err := macro(queryString, args)
			if err != nil {
				return queryString, err
			}
			queryString = strings.Replace(queryString, match[0], res, -1)
		}
	}
	return strings.Trim(queryString, " "), nil
}

// ApplyMacros interpolates macros on a given infinity Query
func ApplyMacros(query Query, timeRange backend.TimeRange) (Query, error) {
	url, err := InterPolateMacros(query.URL, timeRange)
	if err != nil {
		return query, fmt.Errorf("error applying macros to url field. %s", err.Error())
	}
	query.URL = url

	uql, err := InterPolateMacros(query.UQL, timeRange)
	if err != nil {
		return query, fmt.Errorf("error applying macros to uql field. %s", err.Error())
	}
	query.UQL = uql

	groq, err := InterPolateMacros(query.GROQ, timeRange)
	if err != nil {
		return query, fmt.Errorf("error applying macros to uql field. %s", err.Error())
	}
	query.GROQ = groq

	data, err := InterPolateMacros(query.Data, timeRange)
	if err != nil {
		return query, fmt.Errorf("error applying macros to data field. %s", err.Error())
	}
	query.Data = data

	body, err := InterPolateMacros(query.URLOptions.Body, timeRange)
	if err != nil {
		return query, fmt.Errorf("error applying macros to body data field. %s", err.Error())
	}
	query.URLOptions.Body = body

	graphqlQuery, err := InterPolateMacros(query.URLOptions.BodyGraphQLQuery, timeRange)
	if err != nil {
		return query, fmt.Errorf("error applying macros to body graphql query field. %s", err.Error())
	}
	query.URLOptions.BodyGraphQLQuery = graphqlQuery

	for idx, p := range query.URLOptions.Params {
		up, err := InterPolateMacros(p.Value, timeRange)
		if err != nil {
			return query, fmt.Errorf("error applying macros to url parameter field %s. %s", p.Key, err.Error())
		}
		query.URLOptions.Params[idx].Value = up
	}

	return query, nil
}
