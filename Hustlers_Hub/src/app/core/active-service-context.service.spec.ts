import { TestBed } from '@angular/core/testing';

import { ActiveServiceContextService } from './active-service-context.service';

describe('ActiveServiceContextService', () => {
  let service: ActiveServiceContextService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActiveServiceContextService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
