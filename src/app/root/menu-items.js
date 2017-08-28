const menu = [
  {
    title: '',
    items: {
      search: {
        title: 'Поиск',
        url: '/',
        icon: 'search',
      }
    }
  },
  {
    title: 'Наша коллекция',
    items: {
      trends: {
        title: 'Популярное',
        url: '/trends',
        icon: 'favorite_border',
      },
      collection: {
        title: 'Все композиции',
        url: '/collection',
        icon: 'queue_music',
      }
    }
  },
  {
    title: '',
    items: {
      copyrights: {
        title: 'О проекте',
        url: '/copyrights',
        icon: 'info',
      }
    }
  },
  {
    title: 'Партнеры',
    items: {
      visearch: {
        title: 'Поиск видео',
        url: 'https://visear.ch/',
        icon: 'videocam',
        original: true,
        style: 'background-color: #fff176; color: #000; opacity: .9',
      }
    }
  }
];

export default menu;