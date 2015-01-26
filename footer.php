<?php
  $path = null;
  $d = explode("/", trim($path, "/"));
  $srcUrl = '../source.php?dir=' . end($d) . '&amp;file=' . basename($_SERVER["PHP_SELF"]) . '#file';
?> 
<p><a href='../../source.php'>Source</a></p> 
<script src="js/jquery.js"></script>
<script src="js/main.js"></script> 
</body>
</html>