'use client'

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { Combobox } from "@/app/components/ui/combobox";
import { Input } from "./ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from "@/app/components/ui/dialog";
import { profileApi } from "@/lib/api";
import { useRouter } from "next/navigation";

type SchoolCanvasItem = {
    name: string;
    canvas_url: string;
}

type SchoolCanvasList = {
    schools: SchoolCanvasItem[];
}

const BOSTON_SCHOOLS: SchoolCanvasList = {
    schools: [
        {
            name: "Boston College",
            canvas_url: "https://bostoncollege.instructure.com"
        },
        {
            name: "Boston University",
            canvas_url: "https://bostonuniversity.instructure.com"
        },
        {
            name: "Harvard University",
            canvas_url: "https://harvard.instructure.com"
        },
        {
            name: "MIT",
            canvas_url: "https://mit.instructure.com"
        },
        {
            name: "Tufts University",
            canvas_url: "https://tufts.instructure.com"
        },
        {
            name: "Northeastern University",
            canvas_url: "https://northeastern.instructure.com"
        },
        {
            name: "WPI",
            canvas_url: "https://wpi.instructure.com"
        },
        {
            name: "UMass Amherst",
            canvas_url: "https://umass.instructure.com"
        },
        {
            name: "Brandeis University",
            canvas_url: "https://brandeis.instructure.com"
        },
    ]
}

type CanvasConnectorProps = {
    onSave: () => void;
}

const CanvasConnector = ({ onSave }: CanvasConnectorProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [schoolCanvasURL, setSchoolCanvasURL] = useState("");
    const [apiKey, setApiKey] = useState("");
    const router = useRouter();
    const handleConnectCanvas = () => {
        window.open(`${schoolCanvasURL}/profile/settings`, '_blank');
    };

    const handleSave = async () => {
        await profileApi.updateCanvasAPIKey(apiKey, schoolCanvasURL);
        await profileApi.createCanvasCurationJob();
        setIsOpen(false);
        router.refresh();
        onSave();
    };

    return (
        <div className="flex flex-col items-end justify-end gap-0">
            <p className="text-muted-foreground flex flex-col items-end justify-end gap-0">
                <span className="inline-flex items-center gap-1 text-sm">Are you a student? </span>
                <span className="inline-flex items-center gap-1 text-xs">
                    Connect your
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <span className="text-primary underline text-xs font-bold cursor-pointer">Canvas LMS</span>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Connect to Canvas</DialogTitle>
                            </DialogHeader>
                            <div className="flex flex-col gap-4 py-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium">Select your school</label>
                                    <Combobox
                                        options={BOSTON_SCHOOLS.schools.map(school => ({
                                            value: school.canvas_url,
                                            label: school.name
                                        }))}
                                        value={schoolCanvasURL}
                                        onValueChange={setSchoolCanvasURL}
                                        placeholder="Select your school..."
                                    />
                                </div>

                                {schoolCanvasURL && (
                                    <div className="flex flex-col gap-2">
                                        <p className="text-sm">Generate API Key and paste below</p>
                                        <div className="flex items-center gap-2">
                                            <Button onClick={handleConnectCanvas}>Go to Canvas</Button>
                                            <Input
                                                placeholder="API Key"
                                                value={apiKey}
                                                onChange={(e) => setApiKey(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end gap-2">
                                    <DialogClose asChild>
                                        <Button variant="outline">Cancel</Button>
                                    </DialogClose>
                                    <Button
                                        onClick={handleSave}
                                        disabled={!schoolCanvasURL || !apiKey}
                                    >
                                        Save
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <Image src="https://www.instructure.com/sites/default/files/image/2021-12/Canvas_logo_single_mark.png" alt="Canvas" width={16} height={16} />
                </span>
            </p>
        </div>
    );
};

export default CanvasConnector;