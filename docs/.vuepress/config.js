module.exports = {
  title: 'CAC',
  description: 'The queen for command-line applications.',
  themeConfig: {
    repo: 'cacjs/cac',
    editLinks: true,
    docsDir: 'docs',
    nav: [
      {
        text: 'Guide',
        link: '/guide/getting-started'
      },
      {
        text: 'API',
        link: 'https://cac.netlify.com/api'
      }
    ],
    sidebar: [
      {
        title: 'Guide',
        children: [
          '/guide/getting-started',
          '/guide/add-command'
        ]
      }
    ]
  }
}
