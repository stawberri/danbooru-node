const test = require('tape')
const Danbooru = require('..')

test('post fetching', async t => {
  let booru = new Danbooru()
  t.timeoutAfter(30000)

  await Promise.all([
    booru.posts().then(async posts => {
      t.true(Array.isArray(posts), 'returns an array')

      let post = await booru.post(posts[0].id)
      t.equal(post.id, posts[0].id, 'returns individual posts')
    }),
    booru.posts('animal_ears').then(async posts => {
      t.true(posts.every(post => post.tags.includes('animal_ears')), 'searches for tags')

      let post = await booru.post(posts[0])
      t.equal(post.id, posts[0].id, 'can be used instead of ids')
    }),
    booru.posts(['animal ears', '1girl']).then(posts =>
      t.true(posts.every(post => {
        return (
          post.tags.includes('animal_ears') &&
          post.tags.includes('1girl')
        )
      }), 'supports tag arrays')
    ),
    booru.posts('rating:s original').then(posts => {
      for(let post of posts) {
        t.equal(post.rating.s, true, 'has ratings')
        t.equal(typeof post.rating.locked, 'boolean', 'has rating lock status')
      }
    }),
    booru.posts({
      random: true,
      page: 3,
      limit: 100,
      tags: 'status:active filesize:..200kb'
    }).then(async posts => {
      let downloadFile
      for(let post of posts) {
        let file = post.file
        if('request' in file) {
          downloadFile = file
          t.equal(typeof file.md5, 'string', 'has md5 as a string')
          t.equal(typeof file.width, 'number', 'has width as a number')
          t.equal(typeof file.height, 'number', 'has height as a number')
          t.equal(typeof file.name, 'string', 'has name as a string')
          t.equal(typeof file.ext, 'string', 'has ext as a string')
          t.equal(file.ext, post.raw.file_ext, 'has correct extension')
          t.equal(typeof file.size, 'number', 'has size as a number')
          t.equal('large' in file, post.raw.has_large)
        } else {
          t.false('download' in file, 'does not have download')
          t.false('name' in file, 'does not have name')
          t.false('ext' in file, 'does not have ext')
          t.false('md5' in file, 'does not have md5')
        }
      }

      if(downloadFile) {
        t.doesNotThrow(() => {
          downloadFile.preview.download()
        }, 'downloads preview successfully')

        let download = downloadFile.download()

        t.doesNotThrow(() => {
          download = download.data(() => {})
        }, 'exposes progress function')

        let buffer = await download
        t.equal(buffer.length, downloadFile.size, 'downloads correct size file')
      }
    }),
    booru.posts({
      random: true,
      limit: 100,
      tags: 'status:active filesize:5mb..'
    }).then(async posts => {
      let post = posts.find(post => 'request' in post.file)
      if(!post) {
        t.fail('did not give a downloadable file to test abort with')
        return
      }

      let file = post.file

      t.true(file.size >= 5e+6, 'gives files of expected size')

      let progressReports = 0
      let continued = false
      let timeout
      let error = await new Promise(resolve => {
        let download = file.download()

        download.then(() => {
          t.fail('completed download during abort test')
        }, err => resolve(err))

        download.data((progress, total) => {
          progressReports++
          if(continued) t.fail('continued download during abort test')
          if((progress / total) > 0.05) download.abort()
        })

        timeout = setTimeout(() => download.abort(), 500)
      })
      continued = true

      t.true(progressReports > 0, 'sends progress reports')
      t.equal(
        error.message, 'download aborted by user',
        'throws correct error'
      )
    })
  ]).catch(e => t.error(e))

  t.end()
})
