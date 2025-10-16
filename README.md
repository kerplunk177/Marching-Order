# Marching Order for Foundry VTT

A simple and intuitive module for Foundry VTT that allows the Game Master to set a party's marching order and for players to easily view it.

![Latest Version](https://img.shields.io/badge/version-2.1.0-blue)
![Foundry Version](https://img.shields.io/badge/Foundry%20VTT-v13-informational)



---

## Features

* **GM Interface**: A clean drag-and-drop interface for setting and re-ordering the party's marching order.
* **Automatic Actor Detection**: Automatically finds all player-owned actors in the world, requiring zero setup.
* **Player View**: A simple, read-only window for players to see the current marching order.
* **Chat Macro**: A ready-to-use macro to post the current marching order to the chat for everyone to see.
* **Keybinding Support**: GMs can set a custom keybind to quickly open the marching order tool.

---

## Usage

### For the Game Master (GM)

#### Setting the Marching Order
You can open the Marching Order tool in two ways:
1.  **Toolbar Button**: Click the **shoe prints icon** (<i class="fas fa-shoe-prints"></i>) in the Token Controls on the left-hand sidebar.
2.  **Keybinding**: Press the key you've assigned in the "Configure Controls" menu. By default, no key is assigned.

Once open, simply drag actors from the "Available Characters" list on the left to the "Marching Order" list on the right. You can rearrange actors within the Marching Order list by dragging and dropping them into a new position.

### For Players

#### Viewing the Marching Order
Players can view the current marching order by clicking the **shoe prints icon** (<i class="fas fa-shoe-prints"></i>) in the Token Controls on the left-hand sidebar. This will open a smaller, read-only window showing the party's formation.

### Chat Macro

To post the current marching order to the chat, create a new script macro with the following code. When executed, it will create a public chat message displaying the order.

```javascript
// Macro to display the current marching order in chat.
const orderIds = game.settings.get('marching-order', 'marchingOrder');

if (!orderIds || orderIds.length === 0) {
    ui.notifications.warn("No marching order has been set!");
    return;
}

const orderedActors = orderIds.map(id => game.actors.get(id)).filter(Boolean);

let chatContent = '<h3>Marching Order</h3><ol>';
orderedActors.forEach(actor => {
    chatContent += `<li>${actor.name}</li>`;
});
chatContent += '</ol>';

ChatMessage.create({
    user: game.user.id,
    speaker: ChatMessage.getSpeaker({ alias: "Game Master" }),
    content: chatContent,
});
