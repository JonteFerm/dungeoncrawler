window.requestAnimFrame = (function(){
   return window.requestAnimationFrame       || 
   window.webkitRequestAnimationFrame || 
   window.mozRequestAnimationFrame    || 
   window.oRequestAnimationFrame      || 
   window.msRequestAnimationFrame     || 
   function( callback ){
      window.setTimeout(callback, 1);
   };
})();
     
window.cancelRequestAnimFrame = (function(){
   return window.cancelRequestAnimationFrame || 
   window.webkitCancelRequestAnimationFrame || 
   window.mozCancelRequestAnimationFrame    || 
   window.oCancelRequestAnimationFrame      || 
   window.msCancelRequestAnimationFrame     || 
   window.clearTimeout;
})();


//Two global variables. As several prototypes use them, it's best to declare them here.
var element = document.getElementById('flash');
var items = [];

//The player
function Player(){
   var sprite, pos, frozen;

   this.sprite = sprite || document.createElement('div'),
   this.weapon = null,
   this.armour = null,
   this.pos = pos || {left:null,top:null};
   this.sprite.className = 'baddie';
   this.frozen = false;
   element.appendChild(this.sprite);
}

Player.prototype = {
   move: function (moveLeft, moveTop, direction, gameArea, obstacles){
      
         if(!(obstacles[(this.pos.left+moveLeft)+(this.pos.top+moveTop)*21]-10)){
            this.pos.left += moveLeft;
            this.pos.top += moveTop;
            this.sprite.style.left = (-15+this.pos.left*32+32/2)+'px';
            this.sprite.style.top = (-15+this.pos.top*32+32/2)+'px';
         }else{
            this.sprite.className = 'baddie';
         }         
      

   },

   //If an item is specified, the player will pick up that item. If the player does already carry an item of that type - it will drop.
   //If an item is not specified (the pickUp is triggered by a button), the else will look if the player shares a space with an item. If
   //the player does, the pickUp-function will run again with an item specified. Items that is carried is not in the items-array.
   pickUp: function(item){
      item = item || null;
      if(item){
          if(item.type === 'weapon'){
            if(this.weapon){
               this.drop('weapon');
            }

            this.weapon = item;
            this.sprite.appendChild(this.weapon.sprite);
         }
         else if(item.type === 'armour'){
            this.armour = item;
            this.sprite.appendChild(this.armour.sprite);
         }
      
      }else{
         for(var i=0; i<items.length; i++){
            if(items[i].pos.left === this.pos.left && items[i].pos.top === this.pos.top){
               items[i].resetPos();
               this.pickUp(items[i]);
               items.splice(i, 1);
            }
         }
      }

   },

   //The item of specified type is deleted and a copy of that weapon is created and gets the position of the player.
   //The reason for copying is that the weapon has been appended to the player-sprite and it's easier to start over.
   drop: function(itemType){
      if(itemType === 'weapon'){
         if(this.weapon){
            var newWeapon = new Item('weapon', this.weapon.name, {left: this.pos.left, top: this.pos.top}, this.weapon.damage);
            this.weapon.delete();
            this.weapon = null;
         }

      }
      else if(itemType === 'armour'){
         if(this.armour){
            var newWeapon = new Item('armour', this.armour.name, {left: this.pos.left, top: this.pos.top}, this.armour.protection);
            this.armour.delete();
            this.armour = null;
         }
         
      }

   }
   
}

//The item
function Item(type, name, pos, damage, protection){
   var sprite;

   this.type = type;
   this.name = name;
   this.damage = damage || null;
   this.protection = protection || null;
   this.sprite = sprite || document.createElement('div');
   this.sprite.className = type+' '+name;
   this.pos = pos || {left:null,top:null};

   if(this.pos !== null){
      this.sprite.style.left = (-15+this.pos.left*32+32/2)+'px';
      this.sprite.style.top = (-15+this.pos.top*32+32/2)+'px';
      element.appendChild(this.sprite);
   }

   items.push(this);
}

Item.prototype = {
   //Resets the position of left and top. This is done when the item is equipped by the player.
    resetPos: function(){
      this.pos = {left:null, top:null};
      this.sprite.style.left = '';
      this.sprite.style.top = '';
    },

    delete: function(){
      $(this.sprite).remove();
    }
}

function Enemy(type, name, damage, protection, loot, movement){
   var sprite, pos;

   this.sprite = sprite || document.createElement('div');
   this.type = type;
   this.name = name || null;
   this.damage = damage || null;
   this.protection = protection || null;
   this.loot = loot || null;
   this.movement = movement || {x: 0, y: 0};
   this.pos = pos || {left:0,top:0};
   this.sprite.className = 'enemy'+' '+this.type;
   element.appendChild(this.sprite);
}

Enemy.prototype = {
   place: function(left, top, gameArea, obstacles){      
      this.pos.left += left;
      this.pos.top += top;
      this.sprite.style.left = (-15+this.pos.left*32+32/2)+'px';
      this.sprite.style.top = (-15+this.pos.top*32+32/2)+'px';      
   },

   move: function(gameArea, obstacles){
      var moveLeft = Math.round((Math.random()*2)-1);
      var moveTop = Math.round((Math.random()*2)-1);

      if(!(obstacles[(this.pos.left+moveLeft)+(this.pos.top+moveTop)*21]-10)){
            this.pos.left += moveLeft;
            this.pos.top += moveTop;
            this.sprite.style.left = (-15+this.pos.left*32+32/2)+'px';
            this.sprite.style.top = (-15+this.pos.top*32+32/2)+'px';
      }
   }

}

window.Game = (function(){
   var gameArea, obstacles,
   player, baddiePos, enemies, stop = false;

   

   //Initiates the variables for the game and calls the draw-function.
   function initiate(gameAreaStart, obstaclesStart){
      gameArea = gameAreaStart;
      obstacles = obstaclesStart;
      draw();
      player = new Player();
      enemies = [];
      player.move(1, 1, 'down', gameArea, obstacles);
      
      var dagger = new Item('weapon', 'dagger', {left:11,top:6}, 2);
      var club = new Item('weapon', 'club', {left:6,top:3}, 1);
      var armour = new Item('armour', 'chainMail', {left:2,top:2}, null, 2);
      var ghost = new Enemy('ghost', null, 2, 1, null, {x: 2, y: 2});
      var devil = new Enemy('devil', null, 2, 1, null, {x: 2, y: 2});
      enemies.push(ghost);
      enemies.push(devil);
      ghost.place(8, 6, gameArea, obstacles);
      devil.place(8, 2, gameArea, obstacles);


      AI();
   }

   //Draws the game map.
   function draw(){
      for(var i=0; i<gameArea.length; i++){
         var tileElement = document.createElement('div');
         tileElement.innerHTML = '';
         tileElement.className = 'tile t'+gameArea[i]+(obstacles[i] !== 10 ? ' obstacle o'+obstacles[i] : '');
         element.appendChild(tileElement);
      }
   }

   function fight(enemy){
      $('<p>You have encountered a '+enemy.type+' and cannot move until one of you die.</p>')
      .appendTo('#panel');

      var playerRoll = function(){

      };

      var enemyRoll = function(){

      };


   }

   function battleCheck(){
      var currentEnemy = null;
      for(var i=0; i<enemies.length; i++){
         if(enemies[i].pos.left === player.pos.left && enemies[i].pos.top === player.pos.top){
            player.frozen = true;
            stop = true;
            currentEnemy = enemies[i];
         }else if(enemies[i].pos.left+1 === player.pos.left && enemies[i].pos.top === player.pos.top){
            player.frozen = true;
            stop = true;
            currentEnemy = enemies[i];
         }else if(enemies[i].pos.left-1 === player.pos.left && enemies[i].pos.top === player.pos.top){
            player.frozen = true;
            stop = true;
            currentEnemy = enemies[i];          
         }else if(enemies[i].pos.top+1 === player.pos.top && enemies[i].pos.left === player.pos.left){
            player.frozen = true;
            stop = true;
            currentEnemy = enemies[i];           
         }else if(enemies[i].pos.top-1 === player.pos.top && enemies[i].pos.left === player.pos.left){
            player.frozen = true;
            stop = true;
            currentEnemy = enemies[i];        
         }

      }

      if(currentEnemy){
         fight(currentEnemy);
      }
      
   }

   function AI(){
      battleCheck();
      for(var i=0; i<enemies.length; i++){
         enemies[i].move(gameArea,obstacles);
      }

      setTimeout(function(){if(!stop){requestAnimFrame(AI);}}, 1000);
      
   }

   document.onkeydown = function(event){
      var key;

      key = event.keyCode;
      if(!player.frozen){
         switch(key){
            case 65:
               player.move(-1,0,'left', gameArea, obstacles);
               battleCheck();
               break;
            case 68:
               player.move(1,0,'right', gameArea, obstacles);
               battleCheck();
               break;
            case 87:
               player.move(0,-1,'up', gameArea, obstacles);
               battleCheck();
               break;
            case 83:
               player.move(0,1,'down', gameArea, obstacles);
               battleCheck();
         }
      }
   };

   $('#dropWeapon').click(function(){
      player.drop('weapon');
   });
   $('#dropArmour').click(function(){
      player.drop('armour');
   });
   $('#pickUp').click(function(){
      player.pickUp();
   }); 
      


   return{
      'initiate': initiate,
      'AI': AI
   }    

})();

$(document).ready(function(){
   'use strict';
   
   //Loads the world.js-file where the game maps are.
   $.getScript('js/world.js', function()
   { 
      Game.initiate(gameAreaStart, obstaclesStart);
   });

});





   


   

   



