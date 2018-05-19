/*

juxtaposition/server.go

the web server for the miiverse replacement

written by superwhiskers, licensed under gnu agpl.
if you want a copy, go to http://www.gnu.org/licenses/

*/

package main

import (
	// internals

	"html/template"
	"io"
	"net/http"
	// externals
	"github.com/labstack/echo"
)

// Template a template type
type Template struct {
	templates *template.Template
}

// Render renders a template
func (t *Template) Render(w io.Writer, name string, data interface{}, c echo.Context) error {

	// return the parsed template
	return t.templates.ExecuteTemplate(w, name, data)

}

// the https server function
func server(rootPtr *string) {

	// dereference the pointer
	root := *rootPtr

	// create a new echo server object
	e := echo.New()

	// hide the startup banner
	e.HideBanner = true

	// set the renderer to our renderer
	e.Renderer = &Template{

		templates: template.Must(template.ParseGlob((root + "assets/templates/*.tmpl"))),
	}

	// statically serve public files
	e.Static("/assets", (root + "assets/public"))

	// handle get requests
	e.GET("/", func(c echo.Context) error {
		return c.String(http.StatusOK, "Hello, World!")
	})
	e.Logger.Fatal(e.Start(":1323"))

}
