<!doctype html>
<html class="no-js" lang="">

<head>
  <meta charset="utf-8">
  <title>授权成功</title>
  <meta name="description" content="">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>

<body>
  <h1>授权成功</h1>
  <h2>三秒后关闭</h2>
</body>
<script>
  window.onload = function() {
    setTimeout(() => {
      const message = {
        type: 'oauth-token',
        token: '{{token}}'
      }
  
      window.opener.postMessage(message, 'http://127.0.0.1:8080')
      window.close()
    }, 3000)
  }
</script>
</html>
