class Nav {
  constructor() {
    this.leftContent = {};
    this.rightContent = {};
    this.bottomContent = {};
  }

  updateLeft(data) {
    if (this.leftContent[data.country]) {
      this.leftContent[data.country]++;
    } else {
      this.leftContent[data.country] = 0;
    }
    const leftNavElement = document.getElementById('left-nav');
    const indexItem = document.createElement('div');
    const country = document.createElement('div');
    const count = document.createElement('div');
    indexItem.className = 'country-item';
    country.className = 'country';
    count.className = 'count';
    indexItem.appendChild(country);
    indexItem.appendChild(count);
    leftNavElement.appendChild(indexItem);
  }

  updateRight(data) {
    this.rightContent[data.id] = {
      text: data.text,
      name: data.screen_name,
      image: data.profile_image_url
    };
    const rightNavElement = document.getElementById('right-nav');
    if (rightNavElement.childNodes.length === 5) {
      rightNavElement.removeChild(rightNavElement.childNodes[0]);
    }

    const indexItem = document.createElement('div');
    const image = document.createElement('img');
    const name = document.createElement('div');
    const text = document.createElement('div');
    image.src = data.image;
    name.innerHTML = data.name;
    text.innerHTML = data.text;
    indexItem.className = 'tweet-item';
    image.className = 'image';
    name.className = 'name';
    text.className = 'text';
    indexItem.appendChild(image);
    indexItem.appendChild(name);
    indexItem.appendChild(text);
    rightNavElement.appendChild(indexItem);
  }

  updateBottom(data) {
  }
}

window.nav = new Nav();