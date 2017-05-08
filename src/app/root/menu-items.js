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
  }
];

export default menu;