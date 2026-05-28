'use strict';

/* global getUserId, websiteInfoRender */

startPopup();

async function startPopup() {
  const [userId, domainInfo] = await Promise.all([
    getUserId(),
    browser.runtime.sendMessage({ type: 'getDomainInfo' })
  ]);

  if (!domainInfo) {
    document.getElementById('popup').textContent = 'Failed to query tab information';
    return;
  }

  const content = websiteInfoRender(domainInfo, userId, 'popup');

  const popupElement = document.getElementById('popup');
  popupElement.innerHTML = content;
  popupElement.querySelectorAll('.ssph-options').forEach(el => {
    el.addEventListener('click', event => {
      event.preventDefault();
      browser.runtime.openOptionsPage();
    });
  });
}
