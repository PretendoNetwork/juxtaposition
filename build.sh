#!/bin/bash

# get the bash script directory so nothing is screwed up
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# then fix the running directory
cd $DIR

# release build
if [ "$1" == "release" ]; then

    # show a message telling what we are doing
    echo "building release..."
    
    # select the appropriate build config to
    # use
    cp buildconfs/build.prod.go build.conf.go >/dev/null 2>/dev/null
    
    # if an error occured from the cp command...
    if [ "$?" != 0 ]; then
        
        # show an error message  
        echo "an error occured while copying the config"
        echo "check if the buildconfs directory exists, and if build.prod.go exists..."
        exit
    
    fi

    # make the build directory
    mkdir build

    # run the build command
    go build -buildmode=pie -o build/juxtaposition
    
    # to be continued
    
# development build
elif [ "$1" == "dev" ]; then

    # show a message telling what we are doing
    echo "building development build..."
    
    # select the appropriate build
    # config to use
    cp buildconfs/build.devel.go build.conf.go >/dev/null 2>/dev/null
    
    # if an error occured with the cp command...
    if [ "$?" != 0 ]; then

        # show an error message
        echo "an error occured while copying the config"
        echo "check if the buildconfs directory exists, and if build.prod.go exists..."
        exit

    fi
    
    # make the build directory
    mkdir build
    
    # run the build command
    go build -buildmode=pie -o build/juxtaposition
    
    # to be continued

# clean the environment
elif [ "$1" == "clean" ]; then
    
    # show a message telling what we are doing
    echo "cleaning the build environment..."
    
    # clean the build environment
    rm -rf build.conf.go build
    
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
