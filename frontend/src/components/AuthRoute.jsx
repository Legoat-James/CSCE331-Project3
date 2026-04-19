import { useIsAuthenticated } from "../api/authAPI";

export default function AuthRoute({children, allowedRoles}){
    const {role, isPending, isSuccess, isError } = useIsAuthenticated();
    //the role is actually just is_manager boolean
    const roleName = role ? "Manager" : "Cashier";
    console.log(role);
    function checkRole(allowedList){
        return allowedList.includes(roleName)
    }

    if(isPending){
        return (
            <div className="portal-page min-vh-100 d-flex align-items-center justify-content-center py-4 px-3 container-fluid">
                <h2 className="display-4 fw-bold portal-title mb-2">Authenticating...</h2>
            </div>
        )
    }
    if(isError || !checkRole(allowedRoles)){
        return (
            <>
                <div className="portal-page min-vh-100 d-flex flex-column align-items-center justify-content-center py-4 px-3 container-fluid">
                    <h2 className="display-4 fw-bold text-danger mb-2">You are not allowed to access this view</h2>
                    <a className="portal-title fw-bold fs-4" href="/login">Go to Login</a>
                </div>
            </>
            
        )
    }
    if(isSuccess){
        return children;
    }
}   