---
layout: page
title: About
---
<style>

.image-cropper {
  width: 250px;
  height: 250px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 25px;
  overflow: hidden;
  border-radius: 50%;
}

img {
  height: 100%;
  width: auto;
  object-fit: cover;
}

.column {
  float: left;
  width: 40%;
  margin: 25px
}

.row:after {
  content: "";
  display: table;
  clear: both;
}

</style>

<div class="image-cropper">
	<img src="/assets/img/current.JPG" />
</div>

<div class="row">
  <div class="column">
  Hello there, welcome to my blog! I'm a master's student in applied and financial mathematics with a strong interest in data science, programming and scientific visualisation. My goal is to share some of the coolest things I'm learning here, both to benefit others (I hope!) as well as an aid to gain a deeper understanding of these topics myself. After all, there's no better way to process difficult material, I've found, than to try to explain it to someone not familiar with that specific field. Happy reading!
  </div>
  <div class="column">
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