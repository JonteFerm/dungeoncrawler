var element = document.getElementById('flash');
var items = [];

function Player(playerSprite, pos){
      this.playerSprite = playerSprite || document.createElement('div'),
      this.weapon = null,
      this.armour = null,
      this.pos = pos || {left:null,top:null};
      this.playerSprite.className = 'baddie';
}

Player.prototype = {
   move: function (moveLeft, moveTop, direction, gameArea, obstacles){

      if(!(obstacles[(this.pos.left+moveLeft)+(this.pos.top+moveTop)*21]-10)){
         this.pos.left += moveLeft;
         this.pos.top += moveTop;
         this.playerSprite.style.left = (-15+this.pos.left*32+32/2)+'px';
         this.playerSprite.style.top = (-15+this.pos.top*32+32/2)+'px';
      }else{
         this.playerSprite.className = 'baddie';
      }


   },

   pickUp: function(item){
      item = item || null;
      
      if(item){
          if(item.type === 'weapon'){
            if(this.weapon){
               this.weapon.delete();
               this.weapon = null;
            }

            this.weapon = item;
            this.playerSprite.appendChild(this.weapon.itemSprite);
         }
         else if(item.type === 'armour'){
            this.armour = item;
            this.playerSprite.appendChild(this.armour.itemSprite);
         }
      
      }else{
         for(var i=0; i<items.length; i++){
            if(items[i].pos.left === this.pos.left && items[i].pos.top === this.pos.top){
               items[i].resetPos();
               this.pickUp(items[i]);
            }
         }
      }

   },

   drop: function(itemType){
      if(itemType === 'weapon'){
         this.weapon.delete();
         this.weapon = null;
      }
      else if(itemType === 'armour'){
         this.armour.delete();
         this.armour = null;
      }

   }
   
}

function Item(type, name, pos, damage, itemSprite){
   this.type = type || null;
   this.name = name || null;
   this.damage = damage || null;
   this.itemSprite = itemSprite || document.createElement('div');
   this.itemSprite.className = type+' '+name;
   this.pos = pos || null;

   if(this.pos !== null){
      this.itemSprite.style.left = (-15+this.pos.left*32+32/2)+'px';
      this.itemSprite.style.top = (-15+this.pos.top*32+32/2)+'px';
      element.appendChild(this.itemSprite);
   }

   items.push(this);
}

Item.prototype = {
    resetPos: function(){
      this.pos = {left:null, top:null};
      this.itemSprite.style.left = '';
      this.itemSprite.style.top = '';
    },

    delete: function(){
      $(this.itemSprite).remove();
    }


}

window.Game = (function(){
   var gameArea, obstacles,
   player, baddiePos;

   function initiate(gameAreaStart, obstaclesStart){
      gameArea = gameAreaStart;
      obstacles = obstaclesStart;
      draw();
      player = new Player();
      element.appendChild(player.playerSprite);
      player.move(1, 1, 'down', gameArea, obstacles);
      
      var dagger = new Item('weapon', 'dagger', {left:11,top:6}, 2);
      var club = new Item('weapon', 'club', {left:6,top:3}, 1);
      var armour = new Item('armour', 'chainMail', {left:2,top:2});
   }

   function draw(){
      for(var i=0; i<gameArea.length; i++){
         var tileElement = document.createElement('div');
         tileElement.innerHTML = '';
         tileElement.className = 'tile t'+gameArea[i]+(obstacles[i] !== 10 ? ' obstacle o'+obstacles[i] : '');
         element.appendChild(tileElement);
      }
   }

   document.onkeydown = function(event){
      var key;

      key = event.keyCode;

      switch(key){
         case 65:
            player.move(-1,0,'left', gameArea, obstacles);
            break;
         case 68:
            player.move(1,0,'right', gameArea, obstacles);
            break;
         case 87:
            player.move(0,-1,'up', gameArea, obstacles);
            break;
         case 83:
            player.move(0,1,'down', gameArea, obstacles);
      }  
      
   };

      $('#dropWeapon').on('click',function(){
         player.drop('weapon');
      });
      $('#dropArmour').on('click', function(){
         player.drop('armour');
      });
      $('#pickUp').click(function(){
         console.log('hej');
         player.pickUp();
      });


   return{
      'initiate': initiate   
   }    

})();

$(document).ready(function(){
   'use strict';

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

});



   


   

   



