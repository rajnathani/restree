test: test-unit test-supertest

test-unit:
	@NODE_ENV=unittest mocha test/unit/index.js

test-supertest:
	@NODE_ENV=test ./bin/restree -p test/supertest/restree && node test/supertest/index.js