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

  productId: string = '';
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
        console.log("this.productsFav= ");
        console.log(this.productsFav);

        //если в избранном не пусто, то см в крзине
        if (this.productsFav) {

          // загрузка товаров, которые в корзине
          this.cartService.getCart()
            .subscribe((data: CartType | DefaultResponseType) => {
              if ((data as DefaultResponseType).error !== undefined) {
                throw new Error((data as DefaultResponseType).message);
              }
              this.cart = data as CartType;
              console.log("this.cart= ");
              console.log(this.cart);

              // проверка товара в корзине
              if (this.cart && this.cart.items.length > 0) {
                this.productsFav = this.productsFav.map(product => {
                  if (this.cart) {
                    const productInCart = this.cart.items.find(item => item.product.id === product.id)
                    if (productInCart) {
                      product.countInCart = productInCart.quantity;
                    } else {
                      product.countInCart = 0;
                    }
                  }
                  return product;
                });
              }

            })

        }

      });
  }


  updateCount(value: number, productId: string) {
    // если товар уже в корзине, то обновляем
    const inCart = this.cart?.items.find(item => item.product.id === productId)

    if (inCart) {
      this.cartService.updateCart(productId, value)
        .subscribe((data: CartType | DefaultResponseType) => {
          if ((data as DefaultResponseType).error !== undefined) {
            throw new Error((data as DefaultResponseType).message);
          }

        })
    }
  }

  addToCart(productId: string) {
    const inCart = this.cart?.items.find(item => item.product.id === productId)
    if (!inCart) {
      this.cartService.updateCart(productId, 1)
        .subscribe((data: CartType | DefaultResponseType) => {
          if ((data as DefaultResponseType).error !== undefined) {
            throw new Error((data as DefaultResponseType).message);
          }

          this.productsFav.map(product => {
            if (product.id === productId) {
              product.countInCart = 1;
            }
          })

        })
    }
  }

  // удаление из корзины
  removeFromCart(id: string) {
    this.cartService.updateCart(id, 0)
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }

        this.productsFav.map(product => {
          if (product.id === id) {
            product.countInCart = 0;
          }
        })

      })
  }

  // удаление из Избранного
  removeFromFavorites(id: string) {
    this.favoriteService.removeFavorites(id)
      .subscribe((data: DefaultResponseType) => {
        if (data.error) {
          throw new Error(data.message);
        }

        this.productsFav = this.productsFav.filter(item => item.id !== id);
      })
  }
}
