import { TestBed } from '@angular/core/testing';

import { RequestsenderService } from './requestsender.service';

describe('RequestsenderService', () => {
  let service: RequestsenderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RequestsenderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
