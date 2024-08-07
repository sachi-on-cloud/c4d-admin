import {
    Typography,Button
} from "@material-tailwind/react";
import C4DriversAnimation from "../../assets/Images/C4Drivers_animation.gif";
import GroupImage from "../../assets/Images/Group.png";


export function SignIn() {
    return (
    <div className="flex-1 bg-white">
        <div className="justify-around p-4">
            <Typography className="text-black text-2xl text-center font-[Roboto-Medium]">
                Click4Drivers
            </Typography>
            <div className="overflow-hidden mt-10">
                <img className="h-96 w-[100%]" src={C4DriversAnimation} />
            </div>
        </div>
        <div className="justify-between p-4">
            <Typography className="px-5 mb-20 text-center text-black text-xl font-[Roboto-Regular]">
                Explore new ways to travel with Click4Drivers
            </Typography>
            <div className="items-center mb-10">
                <img className="h-50 w-30 m-15" src={GroupImage} />
            </div>
            <div className="mx-5 mt-12 rounded-md overflow-hidden bg-black" >
                hello
                <Button className="text-center text-sm font-[Roboto-Regular] bg-button-valid text-white rounded-xl p-4 items-start">
                    Continue with phone number
                </Button>
            </div>
            <Typography className="pt-6 space-y-4 items-end text-description text-xs mt-8 my-5 mx-6 font-[Roboto-Regular]">
                By continuing, you agree that you have read and accepted our {' '}<Typography className="text-hyperlink-color text-xs underline font-[Roboto-Regular]">
                    T&Cs
                </Typography>{' '} and {' '}<Typography className="text-hyperlink-color text-xs underline font-[Roboto-Regular]">
                    Privacy Policy
                </Typography >
            </Typography >
        </div>
    </div>
)}