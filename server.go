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
	"html/template"
	"io"
	"net/http"
	// externals
	"github.com/fsnotify/fsnotify"
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

	// check if we're running in dev mode
	if serverEnv == "devel" {

		// if so, we use fsnotify to update the templates
		// each time one is changed
		watcher, err := fsnotify.NewWatcher()

		// handle errrors
		if err != nil {

			// print error message
			fmt.Printf("could not create a new fswatcher...\n")

			// panic
			panic(err)

		}

		// close it when this function returns
		defer watcher.Close()

		// tell it to watch the files
		if err := watcher.Add((root + "assets/templates")); err != nil {

			// show an error message
			fmt.Printf("an error has occured while attempting to watch the templates directory...\n")

			// panic on the error
			panic(err)

		}

		// goroutine to update templates when the templates directory is modified
		go func() {

			for {

				select {

				// watch for events
				case _ = <-watcher.Events:

					// let the user know we are updating them
					consoleSequence(fmt.Sprintf("-> updating %stemplates%s!\n", code("green"), code("reset")))

					// update templates
					e.Renderer = &Template{
						templates: template.Must(template.ParseGlob((root + "assets/templates/*.tmpl"))),
					}

				// watch for errors
				case err := <-watcher.Errors:

					// show error message
					fmt.Printf("error while watching files...\n")

					// panic
					panic(err)

				}

			}

		}()

	}

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
		return c.Render(http.StatusOK, "home", map[string]interface{}{
			"haha_yes": "wtf why do i exist",
		})
	})

	// start the server
	e.Logger.Fatal(e.Start(":1323"))

}
