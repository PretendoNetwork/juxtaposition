#!/bin/bash

# release build
if [ "$1" == "release" ]; then

    # show a message telling what we are doing
    echo "building release..."
    
    # select the appropriate build config
    cp buildconfs/build.prod.yaml

    # generate a go file with the binary data from
    # the asset directories and the build config
    go-bindata  -o assets.go assets/ templates/ buildconfs/build.prod.yaml

    # to be continued

# development build
elif [ "$1" == "dev" ]; then

    # show a message telling what we are doing
    echo "building development build..."
    
    # generate a go file with the binary data from
    # the asset directories and the build config
    go-bindata  -o assets.go assets/ templates/ buildconfs/build.devel.yaml

    # to be continued

# show help
else

    echo 
    echo "build.sh [ release | dev | clean ] [ -h | --help ]"
    echo 
    echo "sets up and builds juxtaposition"
    echo 
    echo "options:"
    echo 
    echo "    -h | --help     shows this"
    echo 
    echo "arguments:"
    echo "    release         build a release package (production)"
    echo "    dev             build a development package"
    echo "    clean           clean the build environment"
    echo 

fi