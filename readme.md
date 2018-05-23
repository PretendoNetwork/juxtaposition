# juxtaposition

## reverse's long-overdue golang rewrite

### why the heck whiskers

juxtaposition was created to address numerous issues with reverse, most notably it's reliance on external web servers, and the fact that currently, it uses php, which a rewrite in go has major performance gains over. there are many other reasons why such a rewrite would be desirable, but i'm not going to get into them here because of many unnamed constraints.

### when will this be finished

guess what, i decided to take a break from yamamamura to work on this! hopefully i will be able to live up to your expectations with this project. it can't be too hard, right?

### planned features

- feature parity with reverse
- completely self-contained (no external webserver)
- much quicker than reverse
- code readability
- high configurability

### building from source

#### prerequisites

- [golang](https://golang.org)
- [echo](https://github.com/labstack/echo)
- [gocql](https://github.com/gocql/gocql)
- [go-redis](https://github.com/go-redis/redis)
- [lego](https://github.com/xenolf/lego)
- [ansicolor](https://github.com/shiena/ansicolor)
- [go-yaml](https://github.com/go-yaml/yaml)
- [fsnotify](github.com/fsnotify/fsnotify)

#### building

- clone this repository with `git clone`
- go into the source directory and run `./build.sh`
- then just run the binary generated in the `release/` folder

### developer list

[superwhiskers](https://github.com/superwhiskers) | lead developer