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
   var sprite, pos, frozen, alive, baseProtection;

   this.sprite = sprite || document.createElement('div'),
   this.weapon = null,
   this.armour = null,
   this.pos = pos || {left:null,top:null};
   this.sprite.className = 'baddie';
   this.frozen = false;
   this.alive = true;
   this.baseProtection = 2;
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
            $('<p>You picked up a '+item.name+' which adds '+item.damage+' to your damage.</p>')
            .appendTo('#panel');
         }
         else if(item.type === 'armour'){
            this.armour = item;
            this.sprite.appendChild(this.armour.sprite);
            $('<p>You picked up a '+item.name+' which adds '+item.protection+' to your protection.</p>')
            .appendTo('#panel');
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

function Enemy(type, name, damage, protection, loot, roam){
   var sprite, pos, alive;

   this.sprite = sprite || document.createElement('div');
   this.type = type;
   this.name = name || null;
   this.damage = damage || null;
   this.protection = protection || null;
   this.loot = loot || null;
   this.roam = roam;
   this.pos = pos || {left:0,top:0};
   this.alive = true;
   this.sprite.className = 'enemy'+' '+this.type;
   element.appendChild(this.sprite);
   $('#combatRoll').attr('disabled', true);
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
   player, baddiePos, enemies, stop = false, opponents;
   
   //Initiates the variables for the game and calls the draw-function.
   function initiate(gameAreaStart, obstaclesStart){
      gameArea = gameAreaStart;
      obstacles = obstaclesStart;
      draw();
      player = new Player();
      enemies = [];
      opponents = [];
      player.move(1, 1, 'down', gameArea, obstacles);
      
      var dagger = new Item('weapon', 'dagger', {left:11,top:7}, 2);
      var club = new Item('weapon', 'club', {left:6,top:3}, 1);
      var armour = new Item('armour', 'chainmail', {left:2,top:2}, null, 2);
      var ghost = new Enemy('ghost', null, 2, 1, null, true);
      var devil = new Enemy('devil', null, 2, 1, null, true);
      var devil2 = new Enemy('devil', null, 2, 1, null, false);
      enemies.push(ghost);
      enemies.push(devil);
      enemies.push(devil2)
      ghost.place(8, 7, gameArea, obstacles);
      devil.place(8, 2, gameArea, obstacles);
      devil2.place(10,7,gameArea, obstacles);


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

   function fight(enemy, index){
      
      $('#combatRoll').attr('disabled', false);
      
      $('<p>You are fighting a '+enemy.type+'. Press "combat roll" to start round.</p>')
      .appendTo('#panel');

      function playerAttack(){
         var d20, result;
         d20 = Math.floor((Math.random()*20)+1);

         if(d20 >= 8){
            result = 'hit';
         }else{
            result = 'miss';
         }

         $('<p>D20-roll for hit = '+d20+' which is a '+result+'</p>')
         .appendTo('#panel');

         return result;
      }

      function playerDamage(){
         var d6, mod, total;
         d6 = Math.floor((Math.random()*6)+1);

         if(player.weapon){
            mod = player.weapon.damage;
         }else{
            mod = 0;
         }

         total = d6+mod;

         $('<p>D6-roll for damage = '+d6+' Mod = '+mod+' Total = '+total+'</p>')
         .appendTo('#panel');

         return total;         
      }

      function enemyAttack(){
         var d20, result;
         d20 = Math.floor((Math.random()*20)+1);

         if(d20 >= 8){
            result = 'hit';
         }else{
            result = 'miss';
         }

         $('<p>The '+enemy.type+' rolls for hit = '+d20+' which is a '+result+'</p>')
         .appendTo('#panel');

         return result; 
      }

      function enemyDamage(){
         var d6, mod, total;
         d6 = Math.floor((Math.random()*6)+1);

         mod = enemy.damage;

         total = d6+mod;

         $('<p>D6-roll for damage = '+d6+' Mod = '+mod+' Total = '+total+'</p>')
         .appendTo('#panel');

         return total;   
      }

      $('#combatRoll').one('click', function(){
         var playerHit = playerAttack(),
         playerDamageDone;
         
         if(playerHit === 'hit'){
            playerDamageDone = playerDamage();
            $('<p>You do '+playerDamageDone+' damage. Enemy protection = '+enemy.protection+'</p>')
            .appendTo('#panel');

            if(playerDamageDone > enemy.protection){
               $('<p>You killed the '+enemy.type+'!</p>')
               .appendTo('#panel');

               enemy.alive = false;
            }else{
               $('<p>The '+enemy.type+' still stands.</p>')
            }
         }

         if(enemy.alive){
            var enemyHit = enemyAttack(),
            enemyDamageDone,
            playerProtection = player.baseProtection;

            if(player.armour){
               playerProtection += player.armour.protection;
            }

            if(enemyHit === 'hit'){
               enemyDamageDone = enemyDamage();
               $('<p>'+enemy.type+' do '+enemyDamageDone+' damage. Your protection = '+playerProtection+'.</p>')
               .appendTo('#panel');

               if(enemyDamageDone > playerProtection){
                  $('<p>You got killed.</p>')
                  .appendTo('#panel');

                  player.alive = false;
               }
            }
         }


         if(!enemy.alive){
            enemy.sprite.className = 'enemy blood';
            opponents.splice(index, 1);
            console.log(enemies);
         }

         if(!player.alive){
            player.sprite.className = 'baddie blood';
            player.frozen = true;
            enemies.push(enemy);
            opponents.splice(index, 1);
         }

         if(enemy.alive && player.alive){
            fight(enemy, index);
         }else if(!enemy.alive){
            if(opponents.length > 0){
               fight(opponents[opponents.length-1], opponents.length-1);
            }else{
               stop = false;
               player.frozen = false;
               AI();

            }
         }

      });

      
     
   }

   function battleCheck(){
      var currEnemy;
      for(var i=0; i < enemies.length; i++){
         currEnemy = enemies[i];
         console.log(currEnemy);
         if(currEnemy.pos.left === player.pos.left && currEnemy.pos.top === player.pos.top){
            player.frozen = true;
            stop = true;
            opponents.push(currEnemy);
            enemies.splice(i, 1);
         }
         if(currEnemy.pos.left+1 === player.pos.left && currEnemy.pos.top === player.pos.top){
            player.frozen = true;
            stop = true;
            opponents.push(currEnemy);
            enemies.splice(i, 1);
         }
         if(currEnemy.pos.left-1 === player.pos.left && currEnemy.pos.top === player.pos.top){
            player.frozen = true;
            stop = true;
            opponents.push(currEnemy);
            enemies.splice(i, 1);   
         }
         if(currEnemy.pos.top+1 === player.pos.top && currEnemy.pos.left === player.pos.left){
            player.frozen = true;
            stop = true;
            opponents.push(currEnemy);
            enemies.splice(i, 1);       
         }
         if(currEnemy.pos.top-1 === player.pos.top && currEnemy.pos.left === player.pos.left){
            player.frozen = true;
            stop = true;
            opponents.push(currEnemy);
            enemies.splice(i, 1);   
         }

      }

      if(opponents.length>0){
         $('#panel').html('');
         fight(opponents[opponents.length-1], opponents.length-1);  
      }
   }

   function AI(){
      battleCheck();
      for(var i=0; i<enemies.length; i++){
         if(enemies[i].roam){
            enemies[i].move(gameArea,obstacles);
         }
      }

      setTimeout(function(){if(!stop){requestAnimFrame(AI);}}, 1000);
      
   }

  window.onkeydown = function(event){
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





   


   

   



