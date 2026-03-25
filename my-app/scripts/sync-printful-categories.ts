/**
 * Script to sync Printful categories
 * Run this with: npx ts-node scripts/sync-printful-categories.ts
 */

const PRINTFUL_CATEGORIES = [
  {
    id: 1,
    parent_id: 0,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/fb/fbf0cf796a5603666e85713ece1708a1_t?v=1764596927",
    catalog_position: 1,
    size: "small",
    title: "Men's clothing"
  },
  {
    id: 2,
    parent_id: 0,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/04/04140d7cd1565012645092fc8f1d8632_t?v=1764596927",
    catalog_position: 2,
    size: "small",
    title: "Women's clothing"
  },
  {
    id: 3,
    parent_id: 0,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/96/96e91feb26f0b28ba821534bb0d5478b_t?v=1764596927",
    catalog_position: 3,
    size: "small",
    title: "Kids' & youth clothing"
  },
  {
    id: 4,
    parent_id: 0,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/b1/b1e86be07423274b27b55561ddc6eee9_t?v=1764596927",
    catalog_position: 5,
    size: "small",
    title: "Accessories"
  },
  {
    id: 5,
    parent_id: 0,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/77/7776d01e716d80e3ffbdebbf3db6b198_t?v=1764596927",
    catalog_position: 6,
    size: "small",
    title: "Home & living"
  },
  {
    id: 6,
    parent_id: 1,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/4b/4b37924aaa8e264d1d3cd2a54beb6436_t?v=1764596927",
    catalog_position: 1,
    size: "small",
    title: "All shirts"
  },
  {
    id: 7,
    parent_id: 1,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/48/4895a0d9535a163841a8fb70623abfca_t?v=1764596927",
    catalog_position: 11,
    size: "small",
    title: "All hoodies & sweatshirts"
  },
  {
    id: 8,
    parent_id: 2,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/e0/e0dedef56b629acb74ff014b57c2c487_t?v=1764596927",
    catalog_position: 1,
    size: "small",
    title: "All shirts"
  },
  {
    id: 9,
    parent_id: 2,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/42/4257e29c8e9136f6d4579a2479d246d6_t?v=1764596927",
    catalog_position: 20,
    size: "small",
    title: "All hoodies & sweatshirts"
  },
  {
    id: 10,
    parent_id: 107,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/6c/6c4b87ff2b05b5e4af00a269360463_t?v=1764596927",
    catalog_position: 15,
    size: "small",
    title: "Leggings"
  },
  {
    id: 11,
    parent_id: 2,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/bf/bfec2d7e86efa11f5a3ffd7382732cfd_t?v=1764596927",
    catalog_position: 10,
    size: "small",
    title: "Dresses"
  },
  {
    id: 12,
    parent_id: 3,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/2e/2e1ef19f21392a51e95ffdd16f9249a1_t?v=1764596927",
    catalog_position: 1,
    size: "small",
    title: "All shirts"
  },
  {
    id: 13,
    parent_id: 3,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/89/89df5b9d8911aa16c25a1bb1984a8c41_t?v=1764596927",
    catalog_position: 10,
    size: "small",
    title: "Leggings"
  },
  {
    id: 14,
    parent_id: 3,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/04/0465bd69139899945a1ed5f2c173cdec_t?v=1764596927",
    catalog_position: 12,
    size: "small",
    title: "Baby bodysuits"
  },
  {
    id: 15,
    parent_id: 93,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/26/26bc7142ed3620d32bbd6b5a4d5684e0_t?v=1764596927",
    catalog_position: 0,
    size: "small",
    title: "All hats"
  },
  {
    id: 16,
    parent_id: 4,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/1e/1e3aa205d44b5f70f40dcebd30df1d2f_t?v=1764596927",
    catalog_position: 3,
    size: "small",
    title: "Bags"
  },
  {
    id: 21,
    parent_id: 5,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/5b/5b23616929a3e792452686b85962f88b_t?v=1764596927",
    catalog_position: 3,
    size: "small",
    title: "Wall art"
  },
  {
    id: 22,
    parent_id: 5,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/15/15b564814057a696d22fda3d4453fe8b_t?v=1764596928",
    catalog_position: 14,
    size: "small",
    title: "Towels"
  },
  {
    id: 23,
    parent_id: 6,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/50/505a984d2e4a357ca321f92a79d402cf_t?v=1764596927",
    catalog_position: 13,
    size: "small",
    title: "Tank tops"
  },
  {
    id: 24,
    parent_id: 6,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/b1/b1513c82696405fcc316fc611c57f132_t?v=1764596927",
    catalog_position: 5,
    size: "small",
    title: "T-shirts"
  },
  {
    id: 25,
    parent_id: 6,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/66/669da0fcf673fa899649a03bfab828b4_t?v=1764596927",
    catalog_position: 11,
    size: "small",
    title: "3/4 sleeve shirts"
  },
  {
    id: 26,
    parent_id: 6,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/33/33a8ceef0230030e28a06de1d4c1186c_t?v=1764596927",
    catalog_position: 3,
    size: "small",
    title: "Long sleeve shirts"
  },
  {
    id: 27,
    parent_id: 6,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/f1/f1f46f3b6662abb1663bb0ec749c2626_t?v=1764596927",
    catalog_position: 4,
    size: "small",
    title: "All-over shirts"
  },
  {
    id: 28,
    parent_id: 7,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/aa/aa5b9bd6fec481dded836c582a5d3ec1_t?v=1764596927",
    catalog_position: 15,
    size: "small",
    title: "Hoodies"
  },
  {
    id: 29,
    parent_id: 7,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/20/200a2ac91e9d92d20ea31b35c92fb998_t?v=1764596927",
    catalog_position: 16,
    size: "small",
    title: "Sweatshirts"
  },
  {
    id: 30,
    parent_id: 8,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/61/614e87140c26a80d60355b15c86e15d3_t?v=1764596927",
    catalog_position: 18,
    size: "small",
    title: "Tank tops"
  },
  {
    id: 31,
    parent_id: 8,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/c6/c6cc08d0e6b3fcb15e28d944246b24cc_t?v=1764596927",
    catalog_position: 20,
    size: "small",
    title: "Crop tops"
  },
  {
    id: 32,
    parent_id: 8,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/7b/7b5e253d59c1ffa05023414dbd8ba511_t?v=1764596927",
    catalog_position: 5,
    size: "small",
    title: "T-shirts"
  },
  {
    id: 33,
    parent_id: 8,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/4a/4a162d963b042711b5ce78e5557ce610_t?v=1764596927",
    catalog_position: 11,
    size: "small",
    title: "3/4 sleeve shirts"
  },
  {
    id: 34,
    parent_id: 8,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/28/28ca0c81e02f113cebb9eaa67047045a_t?v=1764596927",
    catalog_position: 21,
    size: "small",
    title: "Long sleeve shirts"
  },
  {
    id: 35,
    parent_id: 8,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/92/92d7deffe690b3d0d34ba7293bbb8c4f_t?v=1764596927",
    catalog_position: 7,
    size: "small",
    title: "All-over shirts"
  },
  {
    id: 36,
    parent_id: 9,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/e6/e6e4aff73d34be63c8d5b36ff4fc90ee_t?v=1764596927",
    catalog_position: 19,
    size: "small",
    title: "Hoodies"
  },
  {
    id: 37,
    parent_id: 9,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/cc/cc038c312495fd88d73b582c6b09e15f_t?v=1764596927",
    catalog_position: 9,
    size: "small",
    title: "Sweatshirts"
  },
  {
    id: 38,
    parent_id: 12,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/b6/b6a957579df32ee1de862559b7dcd2d6_t?v=1764596927",
    catalog_position: 5,
    size: "small",
    title: "T-shirts"
  },
  {
    id: 40,
    parent_id: 15,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/b5/b598db467a3f5bd40d2c4c3ffece0d70_t?v=1764596927",
    catalog_position: 4,
    size: "small",
    title: "Trucker hats"
  },
  {
    id: 41,
    parent_id: 15,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/46/462078b588a16aea0daa8d51e8ddafbf_t?v=1764596927",
    catalog_position: 3,
    size: "small",
    title: "Snapbacks"
  },
  {
    id: 42,
    parent_id: 15,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/13/139452d7fa9122de6814e67deb189ac2_t?v=1764596927",
    catalog_position: 2,
    size: "small",
    title: "Dad hats / baseball caps"
  },
  {
    id: 43,
    parent_id: 15,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/49/496f3391d312489190b731d4fc04917b_t?v=1764596927",
    catalog_position: 6,
    size: "small",
    title: "5-panel hats"
  },
  {
    id: 44,
    parent_id: 15,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/76/76afef1a1498f1cbb8ec0da6bc196c16_t?v=1764596927",
    catalog_position: 7,
    size: "small",
    title: "Mesh hats"
  },
  {
    id: 45,
    parent_id: 15,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/d4/d49372e7781a646dd8d1219299667f1d_t?v=1764596927",
    catalog_position: 1,
    size: "small",
    title: "Beanies"
  },
  {
    id: 46,
    parent_id: 15,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/49/49a8933f67952d90ef432aa55ffc586f_t?v=1764596927",
    catalog_position: 5,
    size: "small",
    title: "Bucket hats"
  },
  {
    id: 47,
    parent_id: 15,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/89/891ebde9b563719cc168d5562e1b288a_t?v=1764596927",
    catalog_position: 8,
    size: "small",
    title: "Visors"
  },
  {
    id: 48,
    parent_id: 16,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/a3/a3981631e6cdc167d04d13b8ea243414_t?v=1764596927",
    catalog_position: 14,
    size: "small",
    title: "Tote bags"
  },
  {
    id: 49,
    parent_id: 16,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/4c/4cabc6d6f996c14db9afb9f4a6f51e4d_t?v=1764596927",
    catalog_position: 19,
    size: "small",
    title: "Drawstring bags"
  },
  {
    id: 51,
    parent_id: 107,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/5b/5b2dddc32c670b7f6581c15c9f29ae5b_t?v=1764596927",
    catalog_position: 25,
    size: "small",
    title: "Shorts"
  },
  {
    id: 55,
    parent_id: 21,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/6f/6f2f0c50f2558af01e4f8eebbc09a66d_t?v=1764596927",
    catalog_position: 21,
    size: "small",
    title: "Posters"
  },
  {
    id: 56,
    parent_id: 21,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/34/347883396e6a71fdb25121f20c85e2b3_t?v=1764596927",
    catalog_position: 25,
    size: "small",
    title: "Framed posters"
  },
  {
    id: 57,
    parent_id: 21,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/7c/7c2dd885646f3971b7199ac833a0232f_t?v=1764596927",
    catalog_position: 27,
    size: "small",
    title: "Canvas prints"
  },
  {
    id: 58,
    parent_id: 106,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/bb/bb22b604c046940b5afa993fed434cd5_t?v=1764596927",
    catalog_position: 12,
    size: "small",
    title: "Shorts"
  },
  {
    id: 60,
    parent_id: 107,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/10/1045bc943ad5971076d561730e52f4d3_t?v=1764596927",
    catalog_position: 15,
    size: "small",
    title: "Skirts"
  },
  {
    id: 63,
    parent_id: 12,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/99/99897bbc9179c1758511ee7831bf01b1_t?v=1764596927",
    catalog_position: 7,
    size: "small",
    title: "All-over shirts"
  },
  {
    id: 79,
    parent_id: 2,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/ae/ae052d0a6b21ac53ece16333d865a42c_t?v=1764596927",
    catalog_position: 16,
    size: "small",
    title: "Swimwear"
  },
  {
    id: 81,
    parent_id: 16,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/20/2074c52a68986ed9c104fb81c59c1188_t?v=1764596927",
    catalog_position: 20,
    size: "small",
    title: "Backpacks"
  },
  {
    id: 85,
    parent_id: 6,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/20/20a525ab712f0e4a8026f7a80751f4f7_t?v=1764596927",
    catalog_position: 9,
    size: "small",
    title: "Embroidered shirts"
  },
  {
    id: 86,
    parent_id: 2,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/33/337bd861919e3fc72196c14c824ae4ff_t?v=1764596927",
    catalog_position: 17,
    size: "small",
    title: "Sports bras"
  },
  {
    id: 88,
    parent_id: 5,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/e6/e65a44ef3a9322c9c90b49253405f63f_t?v=1764596928",
    catalog_position: 24,
    size: "small",
    title: "Aprons"
  },
  {
    id: 89,
    parent_id: 8,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/6a/6a04c987145dca03150d676fb8a92844_t?v=1764596927",
    catalog_position: 8,
    size: "small",
    title: "Embroidered shirts"
  },
  {
    id: 90,
    parent_id: 106,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/f8/f8e62a9df775f3b7d2e886fdfe1e5303_t?v=1764596927",
    catalog_position: 19,
    size: "small",
    title: "Leggings"
  },
  {
    id: 93,
    parent_id: 0,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/0c/0c38c3b13be79b5f8e1f2f1dccf62115_t?v=1764596927",
    catalog_position: 4,
    size: "small",
    title: "Hats"
  },
  {
    id: 95,
    parent_id: 1,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/cf/cfaac716caea797f3e48c267edc34869_t?v=1764596927",
    catalog_position: 6,
    size: "small",
    title: "Jackets & vests"
  },
  {
    id: 96,
    parent_id: 2,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/22/22b7954cec83d6ff32f768ae163ab512_t?v=1764596927",
    catalog_position: 6,
    size: "small",
    title: "Jackets & vests "
  },
  {
    id: 98,
    parent_id: 106,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/a8/a8333cb02ef2a47255d45be7185234d3_t?v=1764596927",
    catalog_position: 17,
    size: "small",
    title: "Sweatpants & joggers"
  },
  {
    id: 99,
    parent_id: 107,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/75/75570e6a358cc5dd682193b9f670875e_t?v=1764596927",
    catalog_position: 23,
    size: "small",
    title: "Sweatpants & joggers"
  },
  {
    id: 100,
    parent_id: 3,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/72/7265a510903c59c77704bbf158f3ad3a_t?v=1764596927",
    catalog_position: 13,
    size: "small",
    title: "Swimwear"
  },
  {
    id: 101,
    parent_id: 16,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/7e/7e276653d84a862b0d07b493ce002fd3_t?v=1764596927",
    catalog_position: 21,
    size: "small",
    title: "Fanny packs"
  },
  {
    id: 105,
    parent_id: 3,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/03/03cf823ebae133f72602f4ea00eb88bd_t?v=1764596927",
    catalog_position: 2,
    size: "small",
    title: "Hoodies & sweatshirts"
  },
  {
    id: 106,
    parent_id: 1,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/e8/e810507648a873b85087af9c5a102970_t?v=1764596927",
    catalog_position: 20,
    size: "small",
    title: "All bottoms"
  },
  {
    id: 107,
    parent_id: 2,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/4c/4c47c07bef6111f24b22d2c75c0bc408_t?v=1764596927",
    catalog_position: 12,
    size: "small",
    title: "All Bottoms"
  },
  {
    id: 108,
    parent_id: 6,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/11/1112539d7f1a7b859a41b9434f08e9ab_t?v=1764596927",
    catalog_position: 10,
    size: "small",
    title: "Polo shirts"
  },
  {
    id: 112,
    parent_id: 5,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/cd/cd21573a67ee3fc691907e26b5d37d29_t?v=1764596927",
    catalog_position: 17,
    size: "small",
    title: "Drinkware & coasters"
  },
  {
    id: 116,
    parent_id: 0,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/9e/9ed797fbbdac07a98f6fdfa06a9f6c8f_t?v=1764596928",
    catalog_position: 7,
    size: "small",
    title: "Collections"
  },
  {
    id: 117,
    parent_id: 116,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/cd/cd9cc4df318744e1a137710d8e379e52_t?v=1764596928",
    catalog_position: 10,
    size: "small",
    title: "Sportswear"
  },
  {
    id: 119,
    parent_id: 116,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/92/923faa74b51263968775a2b8898cf480_t?v=1764596928",
    catalog_position: 12,
    size: "small",
    title: "Streetwear"
  },
  {
    id: 120,
    parent_id: 116,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/9e/9e8ed04bff3e8d8c4056dc6948c79250_t?v=1764596928",
    catalog_position: 13,
    size: "small",
    title: "Beachwear"
  },
  {
    id: 121,
    parent_id: 116,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/0f/0fc974a6095f5f6c6ba062385e5c9f7b_t?v=1764596928",
    catalog_position: 14,
    size: "small",
    title: "Eco-friendly"
  },
  {
    id: 122,
    parent_id: 116,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/f1/f1877c40e5e3e98ff6c87607f68c0f18_t?v=1764596928",
    catalog_position: 15,
    size: "small",
    title: "Gifts"
  },
  {
    id: 123,
    parent_id: 116,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/61/61c5c1ae07e65c90ee94fa089bbca74d_t?v=1764596928",
    catalog_position: 0,
    size: "small",
    title: "New products"
  },
  {
    id: 125,
    parent_id: 106,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/d0/d05fedbb31dc916ef7b53fddd8493365_t?v=1764596927",
    catalog_position: 18,
    size: "small",
    title: "Underwear"
  },
  {
    id: 126,
    parent_id: 4,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/3b/3bf657b23743c2c232e50fdf3e2e7029_t?v=1764596927",
    catalog_position: 12,
    size: "small",
    title: "Face masks"
  },
  {
    id: 129,
    parent_id: 16,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/e2/e2efde2e47e6851578d3f057cfb2f7ca_t?v=1764596927",
    catalog_position: 5,
    size: "small",
    title: "Duffle bags"
  },
  {
    id: 145,
    parent_id: 12,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/b5/b5d6d8fde57c5c4ff8110535ae7e27fb_t?v=1764596927",
    catalog_position: 8,
    size: "small",
    title: "3/4 sleeve shirts"
  },
  {
    id: 155,
    parent_id: 116,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/a8/a815ed433c198b9b89da3dc082188beb_t?v=1764596928",
    catalog_position: 17,
    size: "small",
    title: "Style Trends"
  },
  {
    id: 159,
    parent_id: 0,
    image_url: "https://files.cdn.printful.com/o/upload/catalog_category/0d/0d1c7f7afcc42147f88ee607bcaf9ff6_t?v=1764596928",
    catalog_position: 7,
    size: "small",
    title: "Brands"
  },
];

async function syncCategories() {
  try {
    console.log('Syncing Printful categories...');

    const response = await fetch('http://localhost:3000/api/printful/sync-categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        categories: PRINTFUL_CATEGORIES,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Sync completed:', data);
    return data;
  } catch (error) {
    console.error('❌ Error syncing categories:', error);
    throw error;
  }
}

// Run the sync
syncCategories();
