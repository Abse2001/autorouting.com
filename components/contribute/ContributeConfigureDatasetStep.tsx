"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useGlobalStore } from "@/hooks/use-global-store"
import { useSnippetsBaseApiUrl } from "@/hooks/use-snippets-base-api-url"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover"
import { ChevronDown } from "lucide-react"
import { useState } from "react"

interface ContributeConfigureDatasetStepProps {
  selectedSnippet: string
  onChangeSelectedSnippet: (value: string) => void
  sampleRange: { start: string; end: string }
  onChangeSampleRange: (value: { start: string; end: string }) => void
  onSubmit: () => void
}

export function ContributeConfigureDatasetStep({
  selectedSnippet,
  onChangeSelectedSnippet,
  sampleRange,
  onChangeSampleRange,
  onSubmit,
}: ContributeConfigureDatasetStepProps) {
  const snippetsBaseApiUrl = useSnippetsBaseApiUrl()
  const session = useGlobalStore((s) => s.session)
  const [snippetSelectionOpen, setSnippetSelectionOpen] = useState(false)

  const mySnippets = useQuery({
    queryKey: ["my-snippets"],
    queryFn: () =>
      fetch(
        `${snippetsBaseApiUrl}/snippets/list?owner_name=${session?.github_username}`,
        {
          headers: {
            Authorization: `Bearer ${session?.token}`,
          },
        },
      )
        .then((res) => res.json())
        .then(
          (a) =>
            a.snippets as Array<{
              snippet_id: string
              unscoped_name: string
              owner_name: string
              name: string
            }>,
        ),
  })

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Step 2: Configure Dataset</CardTitle>
        <CardDescription>
          Select a snippet from your{" "}
          <Link href="https://tscircuit.com">tscircuit snippets</Link> and
          define the sample range
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Snippet</label>
          <Popover
            open={snippetSelectionOpen}
            onOpenChange={setSnippetSelectionOpen}
          >
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {selectedSnippet
                  ? mySnippets.data?.find(
                      (s) => s.snippet_id === selectedSnippet,
                    )?.name
                  : "Choose a snippet"}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-white border rounded-md shadow-lg z-10">
              <Command>
                <CommandInput placeholder="Search snippets..." />
                <CommandList>
                  <CommandEmpty>No snippets found.</CommandEmpty>
                  <CommandGroup>
                    {mySnippets.data?.map((snippet) => (
                      <CommandItem
                        key={snippet.snippet_id}
                        className="cursor-pointer hover:bg-gray-100"
                        onSelect={() => {
                          onChangeSelectedSnippet(snippet.snippet_id)
                          setSnippetSelectionOpen(false)
                        }}
                      >
                        {snippet.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Start Sample</label>
            <Input
              type="number"
              value={sampleRange.start}
              onChange={(e) =>
                // @ts-ignore
                onChangeSampleRange((prev) => ({
                  ...prev,
                  start: e.target.value,
                }))
              }
              placeholder="1"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">End Sample</label>
            <Input
              type="number"
              value={sampleRange.end}
              onChange={(e) =>
                // @ts-ignore
                onChangeSampleRange((prev) => ({
                  ...prev,
                  end: e.target.value,
                }))
              }
              placeholder="100"
            />
          </div>
        </div>

        <div className="text-sm text-gray-500">
          After submitting, the dataset will be processed on your machine. The
          snippet will be evaluated over and over again with an increasing
          `sampleNumber` prop. If any snippet fails to render, the dataset will
          be marked as failed.
        </div>
        <div className="text-sm text-gray-500">
          Do not close this page until your dataset has completely processed!
        </div>

        <Button
          onClick={onSubmit}
          variant="outline"
          disabled={!selectedSnippet || !sampleRange.start || !sampleRange.end}
          className="w-full"
        >
          Submit Dataset
        </Button>
      </CardContent>
    </Card>
  )
}
