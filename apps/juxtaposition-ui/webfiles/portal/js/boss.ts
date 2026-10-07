export function initBoss(): void {
	if (!window.wiiuBOSS) {
		return; // No wiiuBoss present in this environment
	}

	var olvInfoCheck = window.wiiuBOSS.isRegisteredBossTask();
	if (!olvInfoCheck.isRegistered) {
		// @ts-expect-error -- Types are wrong for this method
		var olvInfoRegister = window.wiiuBOSS.registerBossTask();
		if (olvInfoRegister.error) {
			alert('Failed to register olvinfo task: ' + olvInfoRegister.error.code);
		}
	}

	var notifCheck = window.wiiuBOSS.isRegisteredDirectMessageTask();
	if (!notifCheck.isRegistered) {
		var notifRegister = window.wiiuBOSS.registerDirectMessageTask();
		if (notifRegister.error) {
			alert('Failed to register notification task: ' + notifRegister.error.code);
		}
	}
}
