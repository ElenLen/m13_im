import {LoaderService} from "./loader.service";

describe('loader service', () => {

  let loaderService: LoaderService;
  beforeEach(() => {
    loaderService = new LoaderService();
  });

  it('should emit true value for showing loader', (done: DoneFn) => {

    loaderService.isShowed$.subscribe(value => {
      expect(value).toBe(true);
      //   для асинхрон добавляем, когда хотим завершить тест
      done();
    });
    loaderService.show();

  });

  it('should emit true value for showing loader', (done: DoneFn) => {

    loaderService.isShowed$.subscribe(value => {
      expect(value).toBe(false);
      //   для асинхрон добавляем, когда хотим завершить тест
      done();
    });
    loaderService.hide();

  });

});
