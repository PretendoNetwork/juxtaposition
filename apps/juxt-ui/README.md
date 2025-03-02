# Juxt-Web

<p align="left">
    <a href="https://discord.gg/rxekqVJ" target="_blank">
        <img src="https://discordapp.com/api/guilds/408718485913468928/widget.png?style=banner3">
    </a>
</p>

## Pretendo replacement for https://portal.olv.nintendo.net and https://ctr.olv.nintendo.net

# What is this?
This is the PN miiverse replacement web UI, which works with the 3DS and Wii U Miiverse Applets

# Install and usage

First install [NodeJS](https://nodejs.org) and [MongoDB](https://mongodb.com). Download/clone this repo and run `npm i` to install all dependencies. Edit `example.config.json` to your liking and rename it `config.json`. Run the server via `npm run start`.

Check out the [Wiki](https://github.com/PretendoNetwork/juxt-web/wiki) for information on how to set up your mongoDB to work with the application

## What works
- [x] View most types of Miiverse posts
   * Text, Painting, Screenshot, Youtube, etc.
- [x] Yeah! Posts
- [x] View Communities
- [x] Follow Communities
- [x] Follow Users
- [x] View User Profiles
- [x] Guest browsing mode
- [x] Full Out-of-box experience
- [x] Authentication with an [account server](https://github.com/PretendoNetwork/account)
- [x] User Bio and privacy settings

## Currently implemented endpoints
 * [GET]  /titles/show
 * [GET]  /communities
 * [GET]  /communities/[title ID]/new
 * [POST] /communities/follow
 * [GET]  /users/show?pid=[user ID]
 * [GET]  /users/me
 * [POST] /users/follow
 * [POST] /post/empathy

## Localization
If you'd like to help localize Pretendo Network, you can check out our project on [Weblate](https://hosted.weblate.org/engage/pretendonetwork/).

<a href="https://hosted.weblate.org/engage/pretendonetwork/">
    <img src="https://hosted.weblate.org/widgets/pretendonetwork/-/juxtaposition/multi-auto.svg" alt="Translation status" />
</a>

## Footnotes

 * The rules still need to be rewritten, as of now they simply reflect what Nintendo came up with at the time
 * This still isn't fully production ready, as it lacks proper error handling in 99% of the client side JS.
 * Because of the above, as well as the sheer complexity of patching the applets themselves, I will not be offering support with setting this up for yourself for the time being. Once the documentation is complete in the wiki I'll be happy to help :)