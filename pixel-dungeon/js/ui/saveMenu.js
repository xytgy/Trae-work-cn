class SaveMenu {
    constructor({ eventBus, saveSystem }) {
        this.eventBus = eventBus;
        this.saveSystem = saveSystem;
        this.isOpen = false;
        this.selectedSlot = -1;
        this.hoverSlot = -1;
        this.slots = [];
        this.menuX = 80;
        this.menuY = 80;
        this.menuWidth = 640;
        this.menuHeight = 440;
        this.slotHeight = 110;
        this.slotPadding = 10;
        this.closeBtnRect = { x: 0, y: 0, w: 80, h: 36 };
        this.slotRects = [];
        this.deleteBtnRects = [];
        this.confirmDialog = null;
        this.animationAlpha = 0;
        this.animationTarget = 0;
    }

    open() {
        this.isOpen = true;
        this.selectedSlot = -1;
        this.hoverSlot = -1;
        this.animationAlpha = 0;
        this.animationTarget = 1;
        this.refreshSlots();
        this.computeLayout();
    }

    close() {
        this.isOpen = false;
        this.animationAlpha = 0;
        this.animationTarget = 0;
        this.confirmDialog = null;
    }

    refreshSlots() {
        this.slots = [];
        for (var i = 0; i < this.saveSystem.SLOT_COUNT; i++) {
            this.slots.push(this.saveSystem.getSaveInfo(i));
        }
    }

    computeLayout() {
        var x = this.menuX;
        var y = this.menuY + 50;
        var w = this.menuWidth;
        var h = this.slotHeight;
        var gap = this.slotPadding;

        this.slotRects = [];
        this.deleteBtnRects = [];

        for (var i = 0; i < this.saveSystem.SLOT_COUNT; i++) {
            var sy = y + i * (h + gap);
            this.slotRects.push({ x: x, y: sy, w: w, h: h });
            this.deleteBtnRects.push({ x: x + w - 36, y: sy + 8, w: 28, h: 28 });
        }

        this.closeBtnRect = {
            x: x + w - 90,
            y: this.menuY + 8,
            w: 80,
            h: 36
        };
    }

    render(ctx) {
        if (!this.isOpen) return;

        this.animationAlpha += (this.animationTarget - this.animationAlpha) * 0.15;

        var alpha = this.animationAlpha;
        if (alpha < 0.01) return;

        ctx.save();
        ctx.globalAlpha = alpha;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        this.renderMenuBg(ctx);
        this.renderTitle(ctx);
        this.renderSlots(ctx);
        this.renderCloseButton(ctx);

        if (this.confirmDialog) {
            this.renderConfirmDialog(ctx);
        }

        ctx.restore();
    }

    renderMenuBg(ctx) {
        var x = this.menuX;
        var y = this.menuY;
        var w = this.menuWidth;
        var h = this.menuHeight;

        ctx.fillStyle = 'rgba(15, 10, 30, 0.95)';
        ctx.strokeStyle = '#ff9900';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 8);
        ctx.fill();
        ctx.stroke();

        ctx.shadowColor = 'rgba(255, 153, 0, 0.3)';
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    renderTitle(ctx) {
        var x = this.menuX;
        var y = this.menuY;
        var w = this.menuWidth;

        ctx.fillStyle = '#ffcc00';
        ctx.font = 'bold 24px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('存档管理', x + w / 2, y + 28);
    }

    renderSlots(ctx) {
        for (var i = 0; i < this.saveSystem.SLOT_COUNT; i++) {
            this.renderSlot(ctx, i);
        }
    }

    renderSlot(ctx, index) {
        var rect = this.slotRects[index];
        var info = this.slots[index];
        var isHover = this.hoverSlot === index;
        var isSelected = this.selectedSlot === index;

        if (isHover) {
            ctx.fillStyle = 'rgba(255, 153, 0, 0.15)';
        } else if (isSelected) {
            ctx.fillStyle = 'rgba(255, 153, 0, 0.1)';
        } else {
            ctx.fillStyle = 'rgba(30, 20, 50, 0.8)';
        }
        ctx.strokeStyle = isHover ? '#ffcc00' : (isSelected ? '#ff9900' : '#555555');
        ctx.lineWidth = isHover ? 2 : 1;
        ctx.beginPath();
        ctx.roundRect(rect.x, rect.y, rect.w, rect.h, 6);
        ctx.fill();
        ctx.stroke();

        var slotLabel = '槽位 ' + (index + 1);
        ctx.fillStyle = '#ffcc00';
        ctx.font = 'bold 14px "Press Start 2P", monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(slotLabel, rect.x + 12, rect.y + 10);

        if (!info) {
            ctx.fillStyle = '#666666';
            ctx.font = '13px "Press Start 2P", monospace';
            ctx.fillText('空存档', rect.x + 12, rect.y + 40);
        } else {
            var charName = info.characterName || '未知';
            var diffLabel = this.getDifficultyLabel(info.difficulty);
            var levelText = '关卡 ' + info.currentLevel;

            ctx.fillStyle = '#ffffff';
            ctx.font = '12px "Press Start 2P", monospace';
            ctx.fillText(charName + '  ' + diffLabel, rect.x + 12, rect.y + 38);

            ctx.fillStyle = '#aaaaaa';
            ctx.font = '11px "Press Start 2P", monospace';
            ctx.fillText(levelText, rect.x + 12, rect.y + 58);

            ctx.fillText('击杀 ' + info.killCount, rect.x + 12, rect.y + 76);
            ctx.fillText('金币 ' + info.gold, rect.x + 180, rect.y + 76);

            if (info.completed) {
                ctx.fillStyle = '#00ff88';
                ctx.fillText('已通关', rect.x + 12, rect.y + 94);
            }

            var timeStr = this.formatTimestamp(info.timestamp);
            ctx.fillStyle = '#888888';
            ctx.font = '10px "Press Start 2P", monospace';
            ctx.textAlign = 'right';
            ctx.fillText(timeStr, rect.x + rect.w - 42, rect.y + 14);
            ctx.textAlign = 'left';

            this.renderDeleteButton(ctx, index);
        }
    }

    renderDeleteButton(ctx, index) {
        var rect = this.deleteBtnRects[index];
        var info = this.slots[index];
        if (!info) return;

        ctx.fillStyle = 'rgba(200, 50, 50, 0.6)';
        ctx.strokeStyle = '#cc3333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(rect.x, rect.y, rect.w, rect.h, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('X', rect.x + rect.w / 2, rect.y + rect.h / 2);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
    }

    renderCloseButton(ctx) {
        var rect = this.closeBtnRect;

        ctx.fillStyle = 'rgba(80, 80, 80, 0.7)';
        ctx.strokeStyle = '#888888';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(rect.x, rect.y, rect.w, rect.h, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '13px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('关闭', rect.x + rect.w / 2, rect.y + rect.h / 2);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
    }

    renderConfirmDialog(ctx) {
        var d = this.confirmDialog;
        if (!d) return;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        var dw = 360;
        var dh = 180;
        var dx = (GAME_WIDTH - dw) / 2;
        var dy = (GAME_HEIGHT - dh) / 2;

        ctx.fillStyle = 'rgba(20, 10, 40, 0.95)';
        ctx.strokeStyle = '#ff6600';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(dx, dy, dw, dh, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffcc00';
        ctx.font = 'bold 14px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('确认删除', dx + dw / 2, dy + 20);

        ctx.fillStyle = '#ffffff';
        ctx.font = '11px "Press Start 2P", monospace';
        ctx.fillText(d.message || '确定要删除这个存档吗？', dx + dw / 2, dy + 55);

        var yesRect = { x: dx + 40, y: dy + dh - 60, w: 120, h: 40 };
        var noRect = { x: dx + dw - 160, y: dy + dh - 60, w: 120, h: 40 };

        ctx.fillStyle = 'rgba(200, 50, 50, 0.8)';
        ctx.strokeStyle = '#cc3333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(yesRect.x, yesRect.y, yesRect.w, yesRect.h, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = 'rgba(80, 80, 80, 0.8)';
        ctx.strokeStyle = '#888888';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(noRect.x, noRect.y, noRect.w, noRect.h, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('确定', yesRect.x + yesRect.w / 2, yesRect.y + yesRect.h / 2);
        ctx.fillText('取消', noRect.x + noRect.w / 2, noRect.y + noRect.h / 2);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';

        d._yesRect = yesRect;
        d._noRect = noRect;
    }

    handleClick(x, y) {
        if (!this.isOpen) return false;

        if (this.confirmDialog) {
            return this.handleConfirmClick(x, y);
        }

        if (this.hitTest(x, y, this.closeBtnRect)) {
            this.close();
            return true;
        }

        for (var i = 0; i < this.saveSystem.SLOT_COUNT; i++) {
            if (this.hitTest(x, y, this.deleteBtnRects[i]) && this.slots[i]) {
                this.showConfirmDialog(i);
                return true;
            }

            if (this.hitTest(x, y, this.slotRects[i])) {
                this.selectedSlot = i;
                if (this.slots[i]) {
                    this.close();
                    if (this.saveSystem.load(i)) {
                        if (this.eventBus) this.eventBus.publish('SAVE_MENU_LOAD', { slotIndex: i });
                    }
                } else {
                    this.close();
                    if (this.saveSystem.save(i)) {
                        this.refreshSlots();
                        if (this.eventBus) this.eventBus.publish('SAVE_MENU_SAVE', { slotIndex: i });
                    }
                }
                return true;
            }
        }

        return true;
    }

    handleConfirmClick(x, y) {
        var d = this.confirmDialog;
        if (!d) return false;

        if (d._yesRect && this.hitTest(x, y, d._yesRect)) {
            this.saveSystem.delete(d.slotIndex);
            this.refreshSlots();
            this.confirmDialog = null;
            return true;
        }

        if (d._noRect && this.hitTest(x, y, d._noRect)) {
            this.confirmDialog = null;
            return true;
        }

        return true;
    }

    showConfirmDialog(slotIndex) {
        var info = this.slots[slotIndex];
        var name = info ? (info.characterName || '未知') : '空存档';
        this.confirmDialog = {
            slotIndex: slotIndex,
            message: '删除 "' + name + '" 的存档？',
            _yesRect: null,
            _noRect: null
        };
    }

    handleMouseMove(x, y) {
        if (!this.isOpen) return;

        this.hoverSlot = -1;

        for (var i = 0; i < this.saveSystem.SLOT_COUNT; i++) {
            if (this.hitTest(x, y, this.slotRects[i])) {
                this.hoverSlot = i;
                return;
            }
        }
    }

    hitTest(x, y, rect) {
        if (!rect) return false;
        return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
    }

    getDifficultyLabel(difficulty) {
        var labels = {
            'easy': '简单',
            'normal': '普通',
            'hard': '困难',
            'nightmare': '噩梦'
        };
        return labels[difficulty] || '普通';
    }

    formatTimestamp(ts) {
        if (!ts) return '未知时间';
        var d = new Date(ts);
        var pad = function(n) { return n < 10 ? '0' + n : '' + n; };
        return (d.getMonth() + 1) + '/' + d.getDate() + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
    }

    update(deltaTime) {
        if (!this.isOpen) return;

        if (this.animationTarget === 1 && this.animationAlpha < 0.99) {
            this.animationAlpha = Math.min(1, this.animationAlpha + deltaTime / 200);
        }
    }
}
