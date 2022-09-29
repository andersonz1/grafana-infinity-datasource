package main

import (
	"net/http"

	"github.com/andersonz1/grafana-plugin-sdk-go/backend"
	"github.com/andersonz1/grafana-plugin-sdk-go/backend/datasource"
	"github.com/andersonz1/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/andersonz1/grafana-plugin-sdk-go/backend/resource/httpadapter"
	"github.com/andersonz1/grafana-infinity-datasource/pkg/infinity"
	settingsSrv "github.com/andersonz1/grafana-infinity-datasource/pkg/settings"
)

type PluginHost struct {
	im instancemgmt.InstanceManager
}

func newDatasource() datasource.ServeOpts {
	host := &PluginHost{
		im: datasource.NewInstanceManager(newDataSourceInstance),
	}
	return datasource.ServeOpts{
		QueryDataHandler:    host,
		CheckHealthHandler:  host,
		CallResourceHandler: httpadapter.New(host.getRouter()),
	}
}

type instanceSettings struct {
	client *infinity.Client
}

func (is *instanceSettings) Dispose() {}

func newDataSourceInstance(setting backend.DataSourceInstanceSettings) (instancemgmt.Instance, error) {
	settings, err := settingsSrv.LoadSettings(setting)
	if err != nil {
		return nil, err
	}
	client, err := infinity.NewClientWithCounters(settings, counters)
	if err != nil {
		return nil, err
	}
	return &instanceSettings{
		client: client,
	}, nil
}

func getInstance(im instancemgmt.InstanceManager, ctx backend.PluginContext) (*instanceSettings, error) {
	instance, err := im.Get(ctx)
	if err != nil {
		return nil, err
	}
	return instance.(*instanceSettings), nil
}

func getInstanceFromRequest(im instancemgmt.InstanceManager, req *http.Request) (*instanceSettings, error) {
	ctx := httpadapter.PluginConfigFromContext(req.Context())
	return getInstance(im, ctx)
}
