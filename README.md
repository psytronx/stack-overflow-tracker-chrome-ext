# stack-overflow-tracker-chrome-ext
Chrome extension that keeps a record of all Stack Overflow pages I visit. 
It sends data from Stack Overflow pages (upon load) to stack-overflow-tracker-service, which has a database that stores my data.

For now, this is pretty basic - most of the code is in content.js. The eventual goal is allow this plugin to correlate my browsing history with software development activities, e.g. Github commits, so that I can easily find the web pages that were helpful at any given stage of development. This would help me or other developers quickly (re)learn skillsets to work with my past projects.
