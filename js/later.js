$('<p>Welcome to Karmanjaka - a land of swords and sorcery!</p>')
      .appendTo($('#panel'))
      .hide()
      .fadeIn(2000, function(){
         $('<p>It is also...</p>')
         .appendTo($('#panel'))
         .hide()
         .delay(1000)
         .fadeIn(2000, function(){
            $('<p>A land of great danger.</p>')
            .appendTo($('#panel'))
            .hide()
            .fadeIn(2000, function(){
               $('<p>Good luck in your adventuring, brave hero.</p>')
               .appendTo($('#panel'))
               .hide()
               .delay(1000)
               .fadeIn(2000, function(){
                  $.getScript('js/world.js', function()
                  { 
                     Game.initiate(gameAreaStart, obstaclesStart);
                  });
               });         
            });             
         });
      });