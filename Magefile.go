//+build mage

package main

import (
	// mage:import
	build "github.com/andersonz1/grafana-plugin-sdk-go/build"
)

var Default = build.BuildAll
