/*

juxtaposition/server.go

the web server for the miiverse replacement

written by superwhiskers, licensed under gnu agpl.
if you want a copy, go to http://www.gnu.org/licenses/

*/

package main

import (
	// internals
	"fmt"
	"net/http"
	"strconv"
	"strings"
	// externals
	"gopkg.in/macaron.v1"
)

var err error

// the https server function
func server() {

	// macaron
	m := macaron.New()

	// pull in some middleware

	// if we are in a development environment,
	// then attach a logger to macaron
	if serverEnv == "devel" {

		// attach the logger
		m.Use(macaron.Logger())

	}

	// don't attempt panic recovery in development
	// environments
	if serverEnv == "prod" {

		// add the panic recovery middleware
		m.Use(macaron.Recovery())

	}

	// a nice handler for the root
	m.Get("/", func(ctx *macaron.Context) string {

		// return some data
		return "path is: " + ctx.Req.RequestURI

	})

	// get the full port
	port := strconv.Itoa(serverPort)

	// output logs
	fmt.Printf("hosting server on %s\n", port)
	err = http.ListenAndServeTLS(strings.Join([]string{":", port}, ""), "pubkey", "privkey", m)

	// show any errors if necissary
	if err != nil {

		// show error message
		fmt.Printf("[err]: error while attempting to start the server...\n")

		// show traceback
		panic(err)
	}

}
