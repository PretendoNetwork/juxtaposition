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
        // externals
        "gopkg.in/macaron.v1"
)

var err error

// the https server function
func notmain() {
    
    // macaron
    m := macaron.Classic()
    
    // a nice handler for the root
    m.Get("/", func(ctx *macaron.Context) string {
        
        // return some data
        return "path is: " + ctx.Req.RequestURI
    
    })
    
    // output logs
    fmt.Printf("hosting server on :5342\n")
    err = http.ListenAndServeTLS(":5342", "pubkey", "privkey", m)
    if err != nil {
        panic(err)
    }
}
