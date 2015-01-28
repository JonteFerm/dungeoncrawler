<?php
  $path = null;
  $d = explode("/", trim($path, "/"));
  $srcUrl = '../source.php?dir=' . end($d) . '&amp;file=' . basename($_SERVER["PHP_SELF"]) . '#file';
?> 
<footer>
	<p>&copy; 2015 <a href='https://github.com/JonteFerm'>Jonathan Ferm</a></p>
	<script src="js/jquery.js"></script>
	<script src="js/main.js"></script> 
</footer>
</body>
</html>