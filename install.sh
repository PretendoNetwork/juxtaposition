#!/bin/bash
# 
# juxtaposition/install.sh
# 
# juxtaposition's installation tool
# 
# written by superwhiskers, licensed under gnu agpl.
# if you want a copy, go to http://www.gnu.org/licenses/
#

# dependencies
#
# please keep them like this:
# `name|description|url|archive`
#
# possible values for archive:
#  - tar: uses tar command
#  - github: this means that url has to be of the format user/repo
#  - zip: extracts with unzip command
deps=(
    "redis|in-memory database, cache, and message broker|http://download.redis.io/releases/redis-4.0.9.tar.gz|tar"
    "cassandra|extremely scalable and fast database|http://mirror.stjschools.org/public/apache/cassandra/3.11.2/apache-cassandra-3.11.2-src.tar.gz|tar"
)

# length of dependency array
depslen=${#deps[@]}

# rootdir variable
rootdir="$(pwd)/juxtaposition-install"

# make a directory for that
mkdir juxtaposition-install

# switch to that directory
cd $rootdir

# make a dependency directory
mkdir deps

# download the dependencies
for i in "${!deps[@]}"; do

    # get the full dependency string
    depstr="${deps[i]}"

    # split the string into an array
    IFS='|' read -r -a dep <<< "$depstr"

    # handle github urls
    if [ "${dep[3]}" == "github" ]; then

        # create the full url if it is one
        dep[2]=https://github.com/${dep[2]}/archive/master.zip

    fi

    # tell the user what we are downloading and
    # installing
    echo
    echo "installing dependency $(($i + 1))/$depslen"
    echo "info:"
    echo "  - name: ${dep[0]}"
    echo "  - description: ${dep[1]}"
    echo "  - download url: ${dep[2]}"
    echo "  - archive format: ${dep[3]}"
    echo

    # tell the user what we are doing
    echo "downloading and unpacking source archive..."

    # pull the dependency
    curl ${dep[2]} > deps/${dep[0]}

    # do one of the extraction methods on it
    if [ "${dep[3]}" == "tar" ]; then

        # extract the tar archive
        tar -xf deps/${dep[0]}

    elif [ "${dep[3]}" == "github" ]; then

        # exctract the zip archive
        unzip deps/${dep[0]}

    elif [ "${dep[3]}" == "zip" ]; then

        # extract the zip archive
        unzip deps/${dep[0]}

    fi

done