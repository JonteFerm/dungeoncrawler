//Global variables. As several prototypes use them, it's best to declare them here.
var element = document.getElementById('flash'), items = [], savedPlayer;

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

//The player
function Player(){
   var sprite, pos, frozen, alive, baseProtection;
   this.sprite = sprite || document.createElement('div'),
   this.weapon = null,
   this.armour = null,
   this.helmet = null,
   this.boots = null,
   this.shirt = null,
   this.pants = null,
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
      if(item && item.type !== 'furniture'){
          item.resetPos();
          $('#panel').html('');
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
            if(this.weapon){
               this.drop('armour');
            }
            this.armour = item;
            this.sprite.appendChild(this.armour.sprite);
            $('<p>You picked up a '+item.name+' which adds '+item.protection+' to your protection.</p>')
            .appendTo('#panel');
         }
         else if(item.type === 'helmet'){
            if(this.helmet){
               this.drop('helmet');
            }
            this.helmet = item;
            this.sprite.appendChild(this.helmet.sprite);
            $('<p>You picked up a '+item.name+' '+item.type+' which adds '+item.protection+' to your protection.</p>')
            .appendTo('#panel');
         }
         else if(item.type === 'basic'){
            if(item.name === 'boots'){
               this.boots = item;
               this.sprite.appendChild(this.boots.sprite);
            }
            if(item.name === 'shirt'){
               this.shirt = item;
               this.sprite.appendChild(this.shirt.sprite);
            }
            if(item.name === 'pants'){
               this.pants = item;
               this.sprite.appendChild(this.pants.sprite);
            }
         }
      }else{
         for(var i=0; i<items.length; i++){
            if(items[i].pos.left === this.pos.left && items[i].pos.top === this.pos.top){
               this.pickUp(items[i]);
               items.splice(i, 1);
               break;
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
            newWeapon.place();
            this.weapon.delete();
            this.weapon = null;
         }

      }
      else if(itemType === 'armour'){
         if(this.armour){
            var newArmour = new Item('armour', this.armour.name, {left: this.pos.left, top: this.pos.top}, this.armour.protection);
            newArmour.place();
            this.armour.delete();
            this.armour = null;
         }
         
      }
      else if(itemType === 'helmet'){
         if(this.armour){
            var newHelmet = new Item('helmet', this.helmet.name, {left: this.pos.left, top: this.pos.top}, this.helmet.protection);
            newHelmet.place();
            this.helmet.delete();
            this.helmet = null;
         }
         
      }

   },

   equipBasic: function(){
      var boots = new Item('basic', 'boots', {left:null,top:null}, null, null);
      this.pickUp(boots);
      var shirt = new Item('basic', 'shirt', {left:null,top:null}, null, null);
      this.pickUp(shirt);
      var pants = new Item('basic', 'pants', {left:null,top:null}, null, null);
      this.pickUp(pants);
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

   items.push(this);
}

Item.prototype = {
   //Resets the position of left and top. This is done when the item is equipped by the player.
    resetPos: function(){
      this.pos = {left:null, top:null};
      this.sprite.style.left = '';
      this.sprite.style.top = '';
    },

    place: function(){
      this.sprite.style.left = (-15+this.pos.left*32+32/2)+'px';
      this.sprite.style.top = (-15+this.pos.top*32+32/2)+'px';
      element.appendChild(this.sprite);
    },

    delete: function(){
      $(this.sprite).remove();
    }
}

function Enemy(type, name, damage, protection, loot, pos, roam){
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
   
   $('#combatRoll').attr('disabled', true);
}

Enemy.prototype = {
   place: function(){
      element.appendChild(this.sprite);   
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
   var gameArea, obstacles, player, baddiePos, stop, enemies, opponents;
   
   //Clears the level nad initiates the variables for the new level, calls the draw-function and starts the AI.
   function initiate(level){
      clearLevel();
      stop = false;
      currLevel = level;
      gameArea = level.gameArea;
      obstacles = level.obstacles;
      draw();
      opponents = [];

      if(savedPlayer){
         player = new Player();
         if(savedPlayer.weapon){player.pickUp(savedPlayer.weapon);}
         if(savedPlayer.armour){player.pickUp(savedPlayer.armour);} 
      }else{
         player = new Player();         
      }

      player.equipBasic();

      player.move(1, 1, 'down', gameArea, obstacles);
      enemies = level.levelEnemies;
      items = level.levelItems;
      
      for(var i=0; i<enemies.length; i++){
         enemies[i].place();
      }

      for(var j=0; j<items.length; j++){
         items[j].place();
      }
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

   //Clears the game map for initiation of the next level.
   function clearLevel(){
      $('#panel').html('');
      while (element.firstChild) {
         element.removeChild(element.firstChild);
      }
   }

   //Handling the combat between the player and one enemy at turn.
   function fight(enemy, index){
      $('#combatRoll').attr('disabled', false);
      
      $('<p>You are fighting a '+enemy.type+'. Press "combat roll" to start round.</p>')
      .appendTo('#panel');

      //The player rolls a dice of 20 to determine if it's a hit.
      function playerAttack(){
         var d20, result;
         d20 = Math.floor((Math.random()*20)+1);

         if(d20 >= 8){
            result = 'hit';
         }else{
            result = 'miss';
         }

         $('<p>You roll d20 for hit = '+d20+' which is a '+result+'</p>')
         .appendTo('#panel');

         return result;
      }

      //The player rolls a dice of 6 for damage with the weapon-damage as a modifier.
      function playerDamage(){
         var d6, mod, total;
         d6 = Math.floor((Math.random()*6)+1);

         if(player.weapon){
            mod = player.weapon.damage;
         }else{
            mod = 0;
         }

         total = d6+mod;

         $('<p>You roll d6 for damage = '+d6+' Mod = '+mod+' Total = '+total+'</p>')
         .appendTo('#panel');

         return total;         
      }

      //The enemy does his roll for hit.
      function enemyAttack(){
         var d20, result;
         d20 = Math.floor((Math.random()*20)+1);

         if(d20 >= 8){
            result = 'hit';
         }else{
            result = 'miss';
         }

         $('<p>The '+enemy.type+' roll d20 for hit = '+d20+' which is a '+result+'</p>')
         .appendTo('#panel');

         return result; 
      }

      //The enemy does his roll for damage.
      function enemyDamage(){
         var d6, mod, total;
         d6 = Math.floor((Math.random()*6)+1);

         mod = enemy.damage;

         total = d6+mod;

         $('<p>The '+enemy.type+' roll d6 for damage = '+d6+' Mod = '+mod+' Total = '+total+'</p>')
         .appendTo('#panel');

         return total;   
      }

      //Each combat round the player is able to click the 'combat roll'-button one time.
      $('#combatRoll').one('click', function(){
         var playerHit = playerAttack(),
         playerDamageDone;
         
         //If the player attack roll is a hit, there is an automatic damage roll which is compared to enemy protection.
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

         //If the enemy is still alive, he may do the same as the player.
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
                  $('#restartLevel').show();
               }
            }
         }

         //If the enemy die, it is removed from opponents array and the sprite turns into blood.
         if(!enemy.alive){
            enemy.sprite.className = 'enemy blood';
            opponents.splice(index, 1);
         }

         //If the player die, his sprite turns into blood.
         if(!player.alive){
            player.sprite.className = 'baddie blood';
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
      
      for(var i=0; i<enemies.length; i++){
         if(enemies[i].roam){
            enemies[i].move(gameArea,obstacles);
         }
      }
      battleCheck();
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
   $('#restartLevel').click(function(){
      $.getScript('js/world.js', function(){ 
            $('#restartLevel').hide();
            initiate(level1);
            Game.AI();
      });
   });
      
   return{
      'initiate': initiate,
      'AI': AI
   }    

})();

function start(level){
   Game.initiate(level);
   Game.AI();
}

$(document).ready(function(){
   'use strict';
   $('#restartLevel').hide();
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
                     //Loads the world.js-file where the game maps are.
                     $.getScript('js/world.js', function()
                     {
                        start(level1);
                     });
                  });         
               });             
            });
         });

});





   


   

   



