---
layout: page
title: About
---

<div class="image-cropper">
	<img src="/assets/img/current.JPG" />
</div>

<div style="display: flex; justify-content: space-between">
  <div style="  display: flex; flex-direction: column; justify-content: space-between; align-items: center; width: 49%">
    <div style="height: auto">
    Hello there, welcome to my blog! I'm a master's student in applied and financial mathematics with a strong interest in data science, programming and scientific visualisation. My goal is to share some of the coolest things I'm learning here, both to benefit others (I hope!) as well as an aid to gain a deeper understanding of these topics myself. After all, there's no better way to process difficult material, I've found, than to try to explain it to someone not familiar with that specific field. Happy reading!
    </div>
    <div style="height: auto; width: 100%">
      <div style="display: flex; justify-content: space-evenly; flex-base: 45%">
        <div>
          <a href="https://github.com/{{ site.github_username| cgi_escape | escape }}">
          <div style="display: flex; flex-direction: column; justify-content: space-evenly">
            <svg class="svg-icon"><use xlink:href="{{ '/assets/minima-social-icons.svg#github' | relative_url }}" /></svg> 
            <span class="username">GitHub</span>
          </div>  
          </a>
        </div>
        <div style="display: flex; flex-direction: column; justify-content: space-evenly">
          <a href="https://www.linkedin.com/in/{{ site.linkedin_username| cgi_escape | escape }}">
            <div>
              <svg class="svg-icon"><use xlink:href="{{ '/assets/minima-social-icons.svg#linkedin' | relative_url }}"></use></svg> 
              <span class="username">LinkedIn</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  </div>
  <div style="width: 49%">
      {%- if site.posts.size > 0 -%}
        <h2 class="post-list-heading">{{ page.list_title | default: "Posts" }}</h2>
        <ul class="post-list">
          {%- for post in site.posts -%}
          <li>
            {%- assign date_format = site.minima.date_format | default: "%b %-d, %Y" -%}
            <span class="post-meta">{{ post.date | date: date_format }}</span>
            <h3>
              <a class="post-link" href="{{ post.url | relative_url }}">
                {{ post.title | escape }}
              </a>
            </h3>
            {%- if site.show_excerpts -%}
              {{ post.excerpt }}
            {%- endif -%}
          </li>
          {%- endfor -%}
        </ul>
        <p class="rss-subscribe">subscribe <a href="{{ "/feed.xml" | relative_url }}">via RSS</a></p>
      {%- endif -%}
  </div>
</div>

