# danbooru-node
danbooru api wrapper

[![NPM](https://nodei.co/npm/danbooru.png?mini=true)](https://nodei.co/npm/danbooru/)
[![Build Status](https://travis-ci.org/stawberri/danbooru-node.svg?branch=master)](https://travis-ci.org/stawberri/danbooru-node)

My api wrapper is super simple! First, you require it:
```javascript
var Danbooru = require('danbooru');
```

Then you just refer to [Danbooru's lovely api documentation](https://danbooru.donmai.us/wiki_pages/43568) and make requests!

## Making requests

```javascript
Danbooru.get('posts', {limit: 5, tags: 'cat_ears'}, function(err, data) {
    if(err) throw err;
    console.log(data); // All of your cute kittehgirls!
});
```

You can also use `Danbooru.post()`, `Danbooru.put()`, and `Danbooru.delete()`. They all have the same parameters and give you the same callback!

### Danbooru.method(path, [params], [callback])
Perform a http request on Danbooru's api!
* `method` _property_. One of `get`, `post`, `put`, or `delete`, depending on what type of request you would like to make.
* `path` _string_. The API documentation mentions a base URL. You put that here! The slash and `.json` are optional.
* `params` _object_. Just provide your parameters as an object!
* `callback` _function(err, data)_. What do you wannya do after you get your api request?
    * `err` _Error_. Node.js callbacks always give you an error for some reason. Here you go!
    * `data` _object_. Parsing JSON output is an extra step, so you don't hafta do it! Here's an already-parsed object for you!

## Authentication
You know what's a pain? Having to type the same stuff over and over again. You know what you hafta do if you want to be authenticated on Danbooru? Send your `login` and `api_key` over and over again.

```javascript
var authedBooru = new Danbooru({login: 'topsecret', api_key: 'evenmoresecret'});
authedBooru.post('favorites', {post_id: 2288637}, function(err, data) {
    if(err) throw err;
    console.log('Successfully favorited!'); // Wow, you do like kittehgirls!
});
```

If that's still too much typing for you, you can use a shortcut!
```javascript
var shortBooru = Danbooru('topsecret', 'evenmoresecret');
```

### [new] Danbooru(object, [api_key])
Save parameters for later. Returns a new Danbooru object that you can use to make requests with those saved parameters.
* `object` _object_. _string_. If you provide an object, it'll be used as default parameters for all requests you make! If you provide a string, it'll set your default `login` parameter to whatever you provide!
* `api_key` _string_. If (and only if) you provided a string for `object`, this will be used as your default `api_key` parameter!
