package infinity

import (
	"context"
	"net/http"
	"net/url"
	"strings"

	dac "github.com/xinsnake/go-http-digest-auth-client"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/clientcredentials"
	"golang.org/x/oauth2/jwt"

	settingsSrv "github.com/andersonz1/grafana-infinity-datasource/pkg/settings"
)

func ApplyOAuthClientCredentials(httpClient *http.Client, settings settingsSrv.InfinitySettings) *http.Client {
	if settings.AuthenticationMethod == settingsSrv.AuthenticationMethodOAuth && settings.OAuth2Settings.OAuth2Type == settingsSrv.AuthOAuthTypeClientCredentials {
		oauthConfig := clientcredentials.Config{
			ClientID:       settings.OAuth2Settings.ClientID,
			ClientSecret:   settings.OAuth2Settings.ClientSecret,
			TokenURL:       settings.OAuth2Settings.TokenURL,
			Scopes:         []string{},
			EndpointParams: url.Values{},
		}
		for _, scope := range settings.OAuth2Settings.Scopes {
			if scope != "" {
				oauthConfig.Scopes = append(oauthConfig.Scopes, scope)
			}
		}
		for k, v := range settings.OAuth2Settings.EndpointParams {
			if k != "" && v != "" {
				oauthConfig.EndpointParams.Set(k, v)
			}
		}
		ctx := context.WithValue(context.Background(), oauth2.HTTPClient, httpClient)
		httpClient = oauthConfig.Client(ctx)
	}
	return httpClient
}
func ApplyOAuthJWT(httpClient *http.Client, settings settingsSrv.InfinitySettings) *http.Client {
	if settings.AuthenticationMethod == settingsSrv.AuthenticationMethodOAuth && settings.OAuth2Settings.OAuth2Type == settingsSrv.AuthOAuthJWT {
		jwtConfig := jwt.Config{
			Email:        settings.OAuth2Settings.Email,
			TokenURL:     settings.OAuth2Settings.TokenURL,
			PrivateKey:   []byte(strings.ReplaceAll(settings.OAuth2Settings.PrivateKey, "\\n", "\n")),
			PrivateKeyID: settings.OAuth2Settings.PrivateKeyID,
			Subject:      settings.OAuth2Settings.Subject,
			Scopes:       []string{},
		}
		for _, scope := range settings.OAuth2Settings.Scopes {
			if scope != "" {
				jwtConfig.Scopes = append(jwtConfig.Scopes, scope)
			}
		}
		ctx := context.WithValue(context.Background(), oauth2.HTTPClient, httpClient)
		httpClient = jwtConfig.Client(ctx)
	}
	return httpClient
}
func ApplyDigestAuth(httpClient *http.Client, settings settingsSrv.InfinitySettings) *http.Client {
	if settings.AuthenticationMethod == settingsSrv.AuthenticationMethodDigestAuth {
		a := dac.NewTransport(settings.UserName, settings.Password)
		httpClient.Transport = &a
	}
	return httpClient
}
