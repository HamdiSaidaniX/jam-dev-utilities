import { useCallback, useState } from "react";
import { Textarea } from "@/components/ds/TextareaComponent";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ds/CardComponent";
import { Button } from "@/components/ds/ButtonComponent";
import { Label } from "@/components/ds/LabelComponent";
import Header from "@/components/Header";
import { useCopyToClipboard } from "@/components/hooks/useCopyToClipboard";
import { CMDK } from "@/components/CMDK";
import CallToActionGrid from "@/components/CallToActionGrid";
import XmlToJsonSEO from "@/components/seo/XmlToJsonSEO";
import Meta from "../../components/Meta";

function xmlToJson(xml: string): unknown {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");
  const parserError = doc.querySelector("parsererror");
  if (parserError) throw new Error("Invalid XML");

  function nodeToJson(node: Node): unknown {
    const obj: Record<string, unknown> = {};
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      if (element.attributes.length > 0) {
        obj["@attributes"] = {};
        for (let i = 0; i < element.attributes.length; i++) {
          const attr = element.attributes[i];
          (obj["@attributes"] as Record<string, string>)[attr.nodeName] = attr.nodeValue || "";
        }
      }
      if (element.hasChildNodes()) {
        for (let i = 0; i < element.childNodes.length; i++) {
          const child = element.childNodes[i];
          if (child.nodeType === Node.TEXT_NODE || child.nodeType === Node.CDATA_SECTION_NODE) {
            const text = child.textContent?.trim();
            if (text) {
              if (element.childNodes.length === 1 && element.attributes.length === 0) return text;
              obj["#text"] = text;
            }
          } else if (child.nodeType === Node.ELEMENT_NODE) {
            const childName = child.nodeName;
            const childValue = nodeToJson(child);
            if (obj[childName] !== undefined) {
              if (!Array.isArray(obj[childName])) obj[childName] = [obj[childName]];
              (obj[childName] as unknown[]).push(childValue);
            } else {
              obj[childName] = childValue;
            }
          }
        }
      }
      if (Object.keys(obj).length === 0) return null;
    }
    return obj;
  }
  const root = doc.documentElement;
  return { [root.nodeName]: nodeToJson(root) };
}

export default function XMLtoJSON() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const { buttonText, handleCopy } = useCopyToClipboard();

  const handleChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = event.currentTarget;
    setInput(value);
    if (!value.trim()) { setOutput(""); return; }
    try {
      const jsonObject = xmlToJson(value.trim());
      setOutput(JSON.stringify(jsonObject, null, 2));
    } catch {
      setOutput("Invalid XML input");
    }
  }, []);

  return (
    <main>
      <Meta title="XML to JSON Converter | Free, Open Source & Ad-free" description="Convert XML to JSON format quickly and easily with Jam's free online XML to JSON converter." />
      <Header />
      <CMDK />
      <section className="container max-w-2xl mb-12">
        <PageHeader title="XML to JSON" description="Free, Open Source & Ad-free" />
      </section>
      <section className="container max-w-2xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div>
            <Label>XML</Label>
            <Textarea rows={8} placeholder="Paste XML here" onChange={handleChange} className="mb-6 font-mono text-sm" value={input} />
            <Label>JSON</Label>
            <Textarea value={output} rows={8} readOnly className="mb-4 font-mono text-sm" />
            <Button variant="outline" onClick={() => handleCopy(output)}>{buttonText}</Button>
          </div>
        </Card>
      </section>
      <CallToActionGrid />
      <section className="container max-w-2xl">
        <XmlToJsonSEO />
      </section>
    </main>
  );
}
