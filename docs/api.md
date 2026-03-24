


## 1. api 1
request:
```curl
GET /api/oauth/state HTTP/1.1
Host: agentrouter.org
Cookie: acw_tc=0a0ccaf517743387201224597e406a4b2464bdf660e33006cfa873389b7db9; session=MTc3NDMzODgyM3xEWDhFQVFMX2dBQUJFQUVRQUFBeF80QUFBUVp6ZEhKcGJtY01EUUFMYjJGMWRHaGZjM1JoZEdVR2MzUnlhVzVuREE0QURHNTZNMDlCYlZKa01ERlBZdz09fAumJBDUQ6M2xsEir7XEm74S4_VCX4z1WbjR-GZUVY92
New-Api-User: -1
Sec-Ch-Ua-Platform: "Windows"
Cache-Control: no-store
Accept-Language: en-US,en;q=0.9
Sec-Ch-Ua: "Chromium";v="145", "Not:A-Brand";v="99"
Sec-Ch-Ua-Mobile: ?0
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
Accept: application/json, text/plain, */*
Sec-Fetch-Site: same-origin
Sec-Fetch-Mode: cors
Sec-Fetch-Dest: empty
Referer: https://agentrouter.org/login
Accept-Encoding: gzip, deflate, br
Priority: u=1, i
Connection: keep-alive
```
response
```curl
HTTP/1.1 200 OK
Date: Tue, 24 Mar 2026 07:55:51 GMT
Content-Type: application/json; charset=utf-8
Content-Length: 51
Connection: keep-alive
Set-Cookie: session=MTc3NDMzODk1MXxEWDhFQVFMX2dBQUJFQUVRQUFBeF80QUFBUVp6ZEhKcGJtY01EUUFMYjJGMWRHaGZjM1JoZEdVR2MzUnlhVzVuREE0QURHd3hWbGhGVURONlIyaFZOZz09fISEz1OGL2mJewMPkRzmHtBKmhPx98VgaK1gHrcSDP93; Path=/; Expires=Thu, 23 Apr 2026 07:55:51 GMT; Max-Age=2592000; HttpOnly; SameSite=Strict
Vary: Accept-Encoding
X-Oneapi-Request-Id: 20260324155551455726585GmhO422P

{"data":"l1VXEP3zGhU6","message":"","success":true}
```

## 2. api 2

request: 
```curl
GET /login/oauth/authorize?client_id=Ov23lidtiR4LeVZvVRNL&state=l1VXEP3zGhU6&scope=user:email HTTP/2
Host: github.com
Cookie: _octo=GH1.1.2001704279.1774328668; _device_id=ae13917120ab78ca6092b90c912f15af; saved_user_sessions=220881537%3ASS0-fBUKRHOAJYDELaIC9I47gG4HO6mJVKDJK6ba_dR0ebIF; user_session=SS0-fBUKRHOAJYDELaIC9I47gG4HO6mJVKDJK6ba_dR0ebIF; logged_in=yes; dotcom_user=navi63
Sec-Ch-Ua: "Chromium";v="145", "Not:A-Brand";v="99"
Sec-Ch-Ua-Mobile: ?0
Sec-Ch-Ua-Platform: "Windows"
Accept-Language: en-US,en;q=0.9
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Sec-Fetch-Site: cross-site
Sec-Fetch-Mode: navigate
Sec-Fetch-User: ?1
Sec-Fetch-Dest: document
Referer: https://agentrouter.org/
Accept-Encoding: gzip, deflate, br
Priority: u=0, i
```

response 
```curl
HTTP/2 302 Found
Date: Tue, 24 Mar 2026 07:55:52 GMT
Content-Type: text/html; charset=utf-8
Content-Length: 0
Vary: X-Fetch-Nonce, X-PJAX, X-PJAX-Container, Turbo-Visit, Turbo-Frame, X-Requested-With, Sec-Fetch-Site,Accept-Encoding, Accept, X-Requested-With
Location: https://agentrouter.org/oauth/github?code=4b0fdc873c61f451cc01&state=l1VXEP3zGhU6
Cache-Control: no-cache
Set-Cookie: color_mode=%7B%22color_mode%22%3A%22auto%22%2C%22light_theme%22%3A%7B%22name%22%3A%22light%22%2C%22color_mode%22%3A%22light%22%7D%2C%22dark_theme%22%3A%7B%22name%22%3A%22dark%22%2C%22color_mode%22%3A%22dark%22%7D%7D; domain=github.com; path=/; secure; SameSite=Lax
Set-Cookie: _gh_sess=HpBNL3r5rqjQeSJ5Sjsz8kCz77mf4USRHSmUIr0cAxx7Q2m43clQ6JB4mfYv9ePGqVMFbf4KuAzaAz69HuMAxXCyW5JwDbdy17d6K8ktEe8FjfWdkubQ%2BSkwX%2F41gOlIpqDFliVtUkIIHCNl34rmcFk3wokB1AdoHFhFS9uDcHr6ItC6LLTkQh7DIc5yVJVT8AFuSsGOeRL%2BpxVkeu4CmX0BL%2FlbbX9uvp%2FjFm9S46SBfaJzIIG1MOr1Cm1VkV3WYqhC4UNcB1vUGLylQjCgacpBpkw7QcXuznU9chhUjYNfIAGLDAYGQE%2B8ILNhc7TcYV65BdJTU7fsMvIETuhynGP2K%2Bxe1H%2BEL5pmog%3D%3D--0t2LfvMTruz21V%2Ff--7lCIieHlApCRKsQmddPEUw%3D%3D; path=/; secure; HttpOnly; SameSite=Lax
Strict-Transport-Security: max-age=31536000; includeSubdomains; preload
X-Frame-Options: sameorigin
X-Content-Type-Options: nosniff
X-Xss-Protection: 0
Referrer-Policy: origin-when-cross-origin, strict-origin-when-cross-origin
Content-Security-Policy: default-src 'none'; base-uri 'self'; child-src github.githubassets.com github.com/assets-cdn/worker/ github.com/assets/ gist.github.com/assets-cdn/worker/; connect-src 'self' uploads.github.com www.githubstatus.com collector.github.com raw.githubusercontent.com api.github.com github-cloud.s3.amazonaws.com github-production-repository-file-5c1aeb.s3.amazonaws.com github-production-upload-manifest-file-7fdce7.s3.amazonaws.com github-production-user-asset-6210df.s3.amazonaws.com *.rel.tunnels.api.visualstudio.com wss://*.rel.tunnels.api.visualstudio.com github.githubassets.com objects-origin.githubusercontent.com copilot-proxy.githubusercontent.com proxy.individual.githubcopilot.com proxy.business.githubcopilot.com proxy.enterprise.githubcopilot.com *.actions.githubusercontent.com wss://*.actions.githubusercontent.com productionresultssa0.blob.core.windows.net productionresultssa1.blob.core.windows.net productionresultssa2.blob.core.windows.net productionresultssa3.blob.core.windows.net productionresultssa4.blob.core.windows.net productionresultssa5.blob.core.windows.net productionresultssa6.blob.core.windows.net productionresultssa7.blob.core.windows.net productionresultssa8.blob.core.windows.net productionresultssa9.blob.core.windows.net productionresultssa10.blob.core.windows.net productionresultssa11.blob.core.windows.net productionresultssa12.blob.core.windows.net productionresultssa13.blob.core.windows.net productionresultssa14.blob.core.windows.net productionresultssa15.blob.core.windows.net productionresultssa16.blob.core.windows.net productionresultssa17.blob.core.windows.net productionresultssa18.blob.core.windows.net productionresultssa19.blob.core.windows.net github-production-repository-image-32fea6.s3.amazonaws.com github-production-release-asset-2e65be.s3.amazonaws.com insights.github.com wss://alive.github.com wss://alive-staging.github.com api.githubcopilot.com api.individual.githubcopilot.com api.business.githubcopilot.com api.enterprise.githubcopilot.com; font-src github.githubassets.com; form-action 'self' github.com gist.github.com copilot-workspace.githubnext.com objects-origin.githubusercontent.com; frame-ancestors 'self'; frame-src viewscreen.githubusercontent.com notebooks.githubusercontent.com; img-src 'self' data: blob: github.githubassets.com media.githubusercontent.com camo.githubusercontent.com identicons.github.com avatars.githubusercontent.com private-avatars.githubusercontent.com github-cloud.s3.amazonaws.com objects.githubusercontent.com release-assets.githubusercontent.com secured-user-images.githubusercontent.com user-images.githubusercontent.com private-user-images.githubusercontent.com opengraph.githubassets.com marketplace-screenshots.githubusercontent.com copilotprodattachments.blob.core.windows.net/github-production-copilot-attachments/ github-production-user-asset-6210df.s3.amazonaws.com customer-stories-feed.github.com spotlights-feed.github.com objects-origin.githubusercontent.com *.githubusercontent.com; manifest-src 'self'; media-src github.com user-images.githubusercontent.com secured-user-images.githubusercontent.com private-user-images.githubusercontent.com github-production-user-asset-6210df.s3.amazonaws.com gist.github.com github.githubassets.com; script-src github.githubassets.com; style-src 'unsafe-inline' github.githubassets.com; upgrade-insecure-requests; worker-src github.githubassets.com github.com/assets-cdn/worker/ github.com/assets/ gist.github.com/assets-cdn/worker/
Server: github.com
X-Github-Request-Id: D783:4A158:D1250F:EE569F:69C24388
```

## 3. api 3
request 
```curl
GET /oauth/github?code=4b0fdc873c61f451cc01&state=l1VXEP3zGhU6 HTTP/1.1
Host: agentrouter.org
Cookie: acw_tc=0a0ccaf517743387201224597e406a4b2464bdf660e33006cfa873389b7db9
Accept-Language: en-US,en;q=0.9
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Sec-Fetch-Site: cross-site
Sec-Fetch-Mode: navigate
Sec-Fetch-User: ?1
Sec-Fetch-Dest: document
Sec-Ch-Ua: "Chromium";v="145", "Not:A-Brand";v="99"
Sec-Ch-Ua-Mobile: ?0
Sec-Ch-Ua-Platform: "Windows"
Referer: https://agentrouter.org/
Accept-Encoding: gzip, deflate, br
Priority: u=0, i
Connection: keep-alive
```

response
```curl
HTTP/1.1 200 OK
Date: Tue, 24 Mar 2026 07:55:53 GMT
Content-Type: text/html; charset=utf-8
Content-Length: 1513
Connection: keep-alive
Cache-Control: no-cache
Vary: Accept-Encoding
X-Oneapi-Request-Id: 20260324155553242162644HZii1C3R

<!doctype html>
<html lang="zh">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="/logo.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#ffffff" />
    <meta
      name="description"
      content="Claude Code, OpenAI Codex, Gemini Cli 公益站"
    />
    <title>Agent Router</title>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-PY29DXE5ZT"></script>
<script defer src="https://cloud.umami.is/script.js" data-website-id="0db7eb38-8ba6-4c94-81be-974df460037a"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-PY29DXE5ZT');
</script>
    <script type="module" crossorigin src="/assets/index-BMWGs8fy.js"></script>
    <link rel="modulepreload" crossorigin href="/assets/react-core-DtMAePju.js">
    <link rel="modulepreload" crossorigin href="/assets/semi-ui-Cmzp5Pbc.js">
    <link rel="modulepreload" crossorigin href="/assets/tools-D0a2lUar.js">
    <link rel="modulepreload" crossorigin href="/assets/react-components-XvIrFW7f.js">
    <link rel="modulepreload" crossorigin href="/assets/i18n-CQ8CMB_4.js">
    <link rel="stylesheet" crossorigin href="/assets/semi-ui-yRXI6evF.css">
    <link rel="stylesheet" crossorigin href="/assets/index-CfVX00Wh.css">
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
```

## 4. api 4

request:
```curl
GET /api/oauth/github?code=4b0fdc873c61f451cc01&state=l1VXEP3zGhU6 HTTP/1.1
Host: agentrouter.org
Cookie: acw_tc=0a0ccaf517743387201224597e406a4b2464bdf660e33006cfa873389b7db9; session=MTc3NDMzODk1MXxEWDhFQVFMX2dBQUJFQUVRQUFBeF80QUFBUVp6ZEhKcGJtY01EUUFMYjJGMWRHaGZjM1JoZEdVR2MzUnlhVzVuREE0QURHd3hWbGhGVURONlIyaFZOZz09fISEz1OGL2mJewMPkRzmHtBKmhPx98VgaK1gHrcSDP93
New-Api-User: -1
Sec-Ch-Ua-Platform: "Windows"
Cache-Control: no-store
Accept-Language: en-US,en;q=0.9
Sec-Ch-Ua: "Chromium";v="145", "Not:A-Brand";v="99"
Sec-Ch-Ua-Mobile: ?0
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
Accept: application/json, text/plain, */*
Sec-Fetch-Site: same-origin
Sec-Fetch-Mode: cors
Sec-Fetch-Dest: empty
Referer: https://agentrouter.org/oauth/github?code=4b0fdc873c61f451cc01&state=l1VXEP3zGhU6
Accept-Encoding: gzip, deflate, br
Priority: u=1, i
Connection: keep-alive

```
response: 
```curl
HTTP/1.1 200 OK
Date: Tue, 24 Mar 2026 07:55:56 GMT
Content-Type: application/json; charset=utf-8
Content-Length: 530
Connection: keep-alive
Set-Cookie: session=MTc3NDMzODk1NnxEWDhFQVFMX2dBQUJFQUVRQUFEX3hmLUFBQVlHYzNSeWFXNW5EQW9BQ0hWelpYSnVZVzFsQm5OMGNtbHVad3dPQUF4bmFYUm9kV0pmTmpZNU1qa0djM1J5YVc1bkRBWUFCSEp2YkdVRGFXNTBCQUlBQWdaemRISnBibWNNQ0FBR2MzUmhkSFZ6QTJsdWRBUUNBQUlHYzNSeWFXNW5EQWNBQldkeWIzVndCbk4wY21sdVp3d0pBQWRrWldaaGRXeDBCbk4wY21sdVp3d05BQXR2WVhWMGFGOXpkR0YwWlFaemRISnBibWNNRGdBTWJERldXRVZRTTNwSGFGVTJCbk4wY21sdVp3d0VBQUpwWkFOcGJuUUVCUUQ5QWdyaXxXVothfkq4AVix4-y71wXCcaDAhZLtzpDJnko-I5OAVw==; Path=/; Expires=Thu, 23 Apr 2026 07:55:56 GMT; Max-Age=2592000; HttpOnly; SameSite=Strict
Vary: Accept-Encoding
X-Oneapi-Request-Id: 20260324155555127291870yqZmahcm

{"data":{"id":66929,"username":"github_66929","password":"","original_password":"","display_name":"GitHub User","role":1,"status":1,"email":"","github_id":"","oidc_id":"","wechat_id":"","telegram_id":"","verification_code":"","access_token":null,"quota":0,"used_quota":0,"request_count":0,"group":"default","aff_code":"","aff_count":0,"aff_quota":0,"aff_history_quota":0,"inviter_id":0,"DeletedAt":null,"linux_do_id":"","setting":"","stripe_customer":"","last_login_time":1774338752,"checked_in":true},"message":"","success":true}
```

## 5. api 5
request:
```curl
GET /api/user/self HTTP/1.1
Host: agentrouter.org
Cookie: acw_tc=0a0ccaf517743387201224597e406a4b2464bdf660e33006cfa873389b7db9; session=MTc3NDMzODk1NnxEWDhFQVFMX2dBQUJFQUVRQUFEX3hmLUFBQVlHYzNSeWFXNW5EQW9BQ0hWelpYSnVZVzFsQm5OMGNtbHVad3dPQUF4bmFYUm9kV0pmTmpZNU1qa0djM1J5YVc1bkRBWUFCSEp2YkdVRGFXNTBCQUlBQWdaemRISnBibWNNQ0FBR2MzUmhkSFZ6QTJsdWRBUUNBQUlHYzNSeWFXNW5EQWNBQldkeWIzVndCbk4wY21sdVp3d0pBQWRrWldaaGRXeDBCbk4wY21sdVp3d05BQXR2WVhWMGFGOXpkR0YwWlFaemRISnBibWNNRGdBTWJERldXRVZRTTNwSGFGVTJCbk4wY21sdVp3d0VBQUpwWkFOcGJuUUVCUUQ5QWdyaXxXVothfkq4AVix4-y71wXCcaDAhZLtzpDJnko-I5OAVw==
New-Api-User: 66929
Sec-Ch-Ua-Platform: "Windows"
Cache-Control: no-store
Accept-Language: en-US,en;q=0.9
Sec-Ch-Ua: "Chromium";v="145", "Not:A-Brand";v="99"
Sec-Ch-Ua-Mobile: ?0
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
Accept: application/json, text/plain, */*
Sec-Fetch-Site: same-origin
Sec-Fetch-Mode: cors
Sec-Fetch-Dest: empty
Referer: https://agentrouter.org/console
Accept-Encoding: gzip, deflate, br
Priority: u=1, i
Connection: keep-alive

```

response: 
```curl
HTTP/1.1 200 OK
Date: Tue, 24 Mar 2026 08:04:44 GMT
Content-Type: application/json; charset=utf-8
Content-Length: 565
Connection: keep-alive
Vary: Accept-Encoding
X-Oneapi-Request-Id: 20260324160444994213322rl6RXRYn

{"data":{"id":66929,"username":"github_66929","password":"","original_password":"","display_name":"GitHub User","role":1,"status":1,"email":"","github_id":"navi63","oidc_id":"","wechat_id":"","telegram_id":"","verification_code":"","access_token":"Wb423dmi/+2MrMdEyBi7XsTwUYyX","quota":140300526,"used_quota":22199474,"request_count":556,"group":"default","aff_code":"GU42","aff_count":0,"aff_quota":0,"aff_history_quota":0,"inviter_id":0,"DeletedAt":null,"linux_do_id":"","setting":"","stripe_customer":"","last_login_time":1774338956},"message":"","success":true}
```