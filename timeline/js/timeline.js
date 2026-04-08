function isMobile() {
    return window.innerWidth <= 768;
}

async function loadTimeline() {
    const response = await fetch('/data/timeline.json');
    const data = await response.json();

    const container = document.getElementById('timeline');

    // 🔽 Sort by year (ascending)
    data.sort((a, b) => {
        const yearA = a.sortYear || parseInt(a.date) || 0;
        const yearB = b.sortYear || parseInt(b.date) || 0;
        return yearA - yearB;
    });

    data.forEach((item, index) => {

        /*const side = index % 2 === 0 ? 'left' : 'right';*/
        const side = isMobile() ? 'center' : (container.children.length % 2 === 0 ? 'left' : 'right');

        const timelineItem = document.createElement('div');
        timelineItem.className = `timeline-item ${side}`;

        const img_str = item.image ? `<img class="timeine-img" src="${item.image}" alt="">` : ''

        timelineItem.innerHTML = `
            <div class="content">
                <span class="year">${item.date}</span>
                <h3>${item.title}</h3>
                <p>${item.description}</p>
                ${item.link ? `<a href="${item.link}" class="read-more">Read more →</a>` : ''}
                <div>
                    ${img_str}
                </div>
            </div>
        `;

        container.appendChild(timelineItem);
    });
}

loadTimeline();