# 1. Install the kit

    npm install kysely mysql2

    or

    yarn add kysely mysql2

    or

    pnpm add kysely mysql2


# 2. Setting TypeScript types and connections

    structure.tsx -> connection.tsx -> query.tsx

# 3. Get List Data
  
    import { getList } from './database/query';

    interface User {
	    id: number;
	    display_name: string;
	    email: string;
    }
    

    export default async function Page() {
	    const result = await getList('app_user', {
		    fields: ['id', 'display_name', 'email'],
		    pagination: { page: 1, limit: 15 }
	    }) as any;

	    return (
		    <div>
			    <h1>User List::</h1>
			    <p>Total {result.total} Users</p>
			    <ul>
			    {result.data.map((user: User) => (
				    <li key={user.id}>
				    {user.display_name} ({user.email})
				    </li>
			    ))}
			    </ul>
			    <div>
			    Current Page {result.page} / Total Pages: {result.totalPages}
			    {result.hasPrev && <button>Previous</button>}
			    {result.hasNext && <button>Next</button>}
			    </div>
		    </div>
	    );
    }