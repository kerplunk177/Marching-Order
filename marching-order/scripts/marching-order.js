class MarchingOrderApp extends FormApplication {
    constructor() {
      super();
      this.marchingOrder = game.settings.get('marching-order', 'marchingOrder');
    }
  
    static get defaultOptions() {
      return mergeObject(super.defaultOptions, {
        id: "marching-order-app",
        title: "Set Marching Order",
        template: "modules/marching-order/templates/marching-order-template.hbs",
        width: 400,
        height: 500,
        classes: ["marching-order-window"],
        resizable: true,
        dragDrop: [{ dragSelector: ".actor-entry.draggable", dropSelector: ".actor-list.droppable" }]
      });
    }
  
    getData() {
      const allPlayerActors = game.actors.filter(a => a.hasPlayerOwner);
      const orderedActors = this.marchingOrder
          .map(actorId => allPlayerActors.find(a => a.id === actorId))
          .filter(Boolean);
      const unorderedActors = allPlayerActors.filter(a => !this.marchingOrder.includes(a.id));
      return {
          orderedActors,
          unorderedActors,
          hasAvailableActors: allPlayerActors.length > 0
      };
    }
  
    async _updateObject(event, formData) {  }
  
    async _onDrop(event) {
      event.preventDefault();
      this.element.find('.drag-over-top, .drag-over-bottom').removeClass('drag-over-top drag-over-bottom');
      const dataString = event.dataTransfer.getData('text/plain');
      if (!dataString) return;
      const data = JSON.parse(dataString);
      if (data.type !== "Actor") return;
      const actorId = data.actorId;
      if (!actorId) return;
  
      const dropTarget = event.target.closest('.actor-entry');
      let newOrder = this.marchingOrder.filter(id => id !== actorId);
  
      if (dropTarget) {
        const targetId = dropTarget.dataset.actorId;
        const targetIndex = newOrder.indexOf(targetId);
        const rect = dropTarget.getBoundingClientRect();
        const isTopHalf = event.clientY < rect.top + rect.height / 2;
        if (isTopHalf) newOrder.splice(targetIndex, 0, actorId);
        else newOrder.splice(targetIndex + 1, 0, actorId);
      } else {
        newOrder.push(actorId);
      }
      this.marchingOrder = newOrder;
      await this._saveOrder();
      this.render();
    }
  
    async _saveOrder() {
      await game.settings.set('marching-order', 'marchingOrder', this.marchingOrder);
    }
  
    activateListeners(html) {
      super.activateListeners(html);
      html.find('.actor-entry.draggable').on('dragstart', ev => {
          const actorId = ev.currentTarget.dataset.actorId;
          const dragData = { type: "Actor", actorId: actorId };
          ev.originalEvent.dataTransfer.setData('text/plain', JSON.stringify(dragData));
      });
      const dropZone = html.find('.actor-list.droppable');
      dropZone.on('dragover', ev => {
          ev.preventDefault();
          dropZone.find('.drag-over-top, .drag-over-bottom').removeClass('drag-over-top drag-over-bottom');
          const dropTarget = ev.target.closest('.actor-entry');
          if (!dropTarget) return;
          const rect = dropTarget.getBoundingClientRect();
          const isTopHalf = event.clientY < rect.top + rect.height / 2;
          if (isTopHalf) dropTarget.classList.add('drag-over-top');
          else dropTarget.classList.add('drag-over-bottom');
      });
      dropZone.on('dragleave', ev => dropZone.find('.drag-over-top, .drag-over-bottom').removeClass('drag-over-top drag-over-bottom'));
      html.find('.remove-actor').click(async (ev) => {
          const actorId = $(ev.currentTarget).closest('.actor-entry').data('actorId');
          this.marchingOrder = this.marchingOrder.filter(id => id !== actorId);
          await this._saveOrder();
          this.render(true);
      });
      html.find('.clear-order').click(async (ev) => {
          this.marchingOrder = [];
          await this._saveOrder();
          this.render(true);
      });
    }
  }
  
  class PlayerMarchingOrderApp extends Application {
      static get defaultOptions() {
          return mergeObject(super.defaultOptions, {
              id: "player-marching-order-app",
              title: "Party Marching Order",
              template: "modules/marching-order/templates/player-marching-order-template.hbs",
              width: 250,
              height: "auto",
              classes: ["marching-order-player-window"],
          });
      }
  
      getData() {
          const orderIds = game.settings.get('marching-order', 'marchingOrder');
          const orderedActors = orderIds.map(id => game.actors.get(id)).filter(Boolean);
          return { orderedActors };
      }
  }
  
  
  Hooks.once('init', () => {
    game.settings.register('marching-order', 'marchingOrder', { scope: 'world', config: false, type: Array, default: [] });
    game.keybindings.register('marching-order', 'open', {
      name: 'Open Marching Order',
      hint: 'Opens the GM view for setting the party\'s marching order.',
      onDown: () => { new MarchingOrderApp().render(true); },
      restricted: true, // GM only
    });
  });
  
  Hooks.on("getSceneControlButtons", (controls) => {
    const tokenControls = controls.tokens;
  
    if (!tokenControls) return;
  
    if (game.user.isGM) {
      tokenControls.tools["marching-order-gm"] = {
        name: "marching-order-gm",
        title: "Set Marching Order",
        icon: "fas fa-shoe-prints",
        onClick: () => { new MarchingOrderApp().render(true); },
        button: true,
      };
    } else {
      tokenControls.tools["marching-order-player"] = {
        name: "marching-order-player",
        title: "View Marching Order",
        icon: "fas fa-shoe-prints",
        onClick: () => { new PlayerMarchingOrderApp().render(true); },
        button: true,
      };
    }
  });