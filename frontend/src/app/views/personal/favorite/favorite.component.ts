import {Component, OnInit} from '@angular/core';
import {FavoriteService} from "../../../shared/services/favorite.service";
import {FavoriteType} from "../../../../types/favorite.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {environment} from "../../../../environments/environment";
import {CartType} from "../../../../types/cart.type";
import {CartService} from "../../../shared/services/cart.service";

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.scss']
})
export class FavoriteComponent implements OnInit {
  count: number = 1;
  // для сохранения при выборе количества
  countId: {
    id: string,
    num: number
  }[] = [];
  productsFav: FavoriteType[] = [];
  serverStaticPath = environment.serverStaticPath;
  cart: CartType | null = null;

  constructor(private favoriteService: FavoriteService,
              private cartService: CartService,) {
  }

  ngOnInit(): void {
    // избранные товары
    this.favoriteService.getFavorites()
      .subscribe((data: FavoriteType[] | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          const error = (data as DefaultResponseType).message;
          throw new Error(error);
        }

        // список избранных товаров
        this.productsFav = data as FavoriteType[];

        // загрузка товаров, которые в корзине
        this.loadCartData();
      });
  }

  private loadCartData(): void {
    // в корзине
    this.cartService.getCart()
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        this.cart = data as CartType;

        // установка countInCart для каждого товара
        this.productsFav.forEach(product => {
          const productInCart = this.cart?.items.find(item => item.product.id === product.id);

          if (productInCart) {
            // если товар уже в корзине
            product.countInCart = productInCart.quantity;

            // обновляем или добавляем в countId
            const existingItem = this.countId.find(item => item.id === product.id);
            if (existingItem) {
              existingItem.num = productInCart.quantity;
            } else {
              this.countId.push({id: product.id, num: productInCart.quantity});
            }
          } else {
            // если товара нет в корзине
            product.countInCart = 0;
            //  устанавливаем количество по умолчанию 1
            const existingItem = this.countId.find(item => item.id === product.id);
            if (!existingItem) {
              this.countId.push({id: product.id, num: 1});
            }
          }
        });
      });
  }

  updateCount(count: number, productId: string) {
    // min количество - 1
    const actualCount = Math.max(1, count);

    // обновляем значение в countId
    const item = this.countId.find(item => item.id === productId);
    if (item) {
      item.num = actualCount;
    } else {
      this.countId.push({id: productId, num: actualCount});
    }

    // находим товар в productsFav
    const product = this.productsFav.find(p => p.id === productId);
    if (!product) return;

    // если товар уже в корзине - обновляем количество
    if (product.countInCart && product.countInCart > 0) {
      this.updateCartQuantity(productId, actualCount);
    }
    // если товар не в корзине, но пользователь выбрал количество > 0 - ничего не делаем
    // товар добавится в корзину только при нажатии кнопки "В корзину"
  }

  addToCart(productId: string) {
    const product = this.productsFav.find(p => p.id === productId);
    if (!product) return;

    // получаем выбранное количество
    const countItem = this.countId.find(item => item.id === productId);
    const quantity = countItem ? countItem.num : 1;

    // добавляем товар в корзину
    this.cartService.updateCart(productId, quantity)
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }

        // обновляем локальные данные
        this.cart = data as CartType;
        product.countInCart = quantity;

        // обновляем countId чтобы синхр-ть с реальным количеством в корзине
        const item = this.countId.find(item => item.id === productId);
        if (item) {
          item.num = quantity;
        }
      });
  }

  // удаление из корзины
  removeFromCart(product: FavoriteType) {
    this.cartService.updateCart(product.id, 0)
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }

        // обновляем локальные данные
        this.cart = data as CartType;
        product.countInCart = 0;

        // сбрасываем количество до 1 в countId
        const item = this.countId.find(item => item.id === product.id);
        if (item) {
          item.num = 1;
        }
      });
  }

  private updateCartQuantity(productId: string, quantity: number): void {
    this.cartService.updateCart(productId, quantity)
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }

        // обновляем локальные данные
        this.cart = data as CartType;

        const product = this.productsFav.find(p => p.id === productId);
        if (product) {
          product.countInCart = quantity;
        }
      });
  }

  // удаление из Избранного
  removeFromFavorites(id: string) {
    this.favoriteService.removeFavorites(id)
      .subscribe((data: DefaultResponseType) => {
        if (data.error) {
          throw new Error(data.message);
        }

        this.productsFav = this.productsFav.filter(item => item.id !== id);

        // удаляем также из countId
        this.countId = this.countId.filter(item => item.id !== id);
      })
  }

}
