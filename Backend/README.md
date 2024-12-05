# Deployment
The project is built on nest
1. Had to run yarn build so that dist folder can be created - which was done perfectly.
2. Had to run yarn start | the project was able to run perfectly. 


# Create New Project

nest new

# Create Controller

nest g co [path]

--dry-run

--no-spec

# Access Route Params

@Param() Decorator

> @Get(':id')

- Example 1:

> findOne(@Param() params) {
>
> return `${params.id}`
>
> }

- Example 2:

> findOne(@Param('id') id: string)
> {
>
> return `${id}`
>
> }

# Post Request

@Body() Decorator

> @Post()
>
> create(@Body() body) {
>
> return body;
>
> }

# Response Codes

@Res() Decorator

- Example 1:

> findAll(@Res() response) {
>
> response.status(200).send('This is my Response')
>
> }

- Example 2:

> findAll(@Res() response) {
>
> response.status(200).send('This is my Response')
>
> }

# Services

> nest g s

# Erros & Exceptions

> throw new HttpException(`Erro Msg`, HttpStatus.Not_FOUND);

> throw new NotFoundException(`Error Msg`);

> throw new InternalServerException(`Error Msg`);

> throw new BadRequestException(`Error Msg`);

# Modules

> nest g module MODULE_NAME
