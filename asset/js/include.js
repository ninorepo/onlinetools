async function include()
{
    try
    {
        // find all comment nodes
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_COMMENT,
            null,
            false
        );

        const comments = [];

        // collect include comments
        while (walker.nextNode())
        {
            const comment = walker.currentNode;

            const match =
                comment.nodeValue
                .trim()
                .match(/^include:(.+)$/);

            if (match)
            {
                comments.push({
                    node: comment,
                    file: match[1].trim()
                });
            }
        }

        // process each include
        for (const item of comments)
        {
            const response =
                await fetch(
                    "../asset/include/" + item.file
                );

            if (!response.ok)
            {
                throw new Error(
                    "Failed to load " + item.file
                );
            }

            // get html text
            const html =
                await response.text();

            // parse html
            const parser =
                new DOMParser();

            const doc =
                parser.parseFromString(
                    html,
                    "text/html"
                );

            // remove redirect meta
            doc.querySelectorAll(
                'meta[http-equiv="refresh"]'
            ).forEach(el => el.remove());

            // create fragment
            const fragment =
                document.createDocumentFragment();

            // move body content
            while (doc.body.firstChild)
            {
                fragment.appendChild(
                    doc.body.firstChild
                );
            }

            // replace comment with content
            item.node.parentNode.replaceChild(
                fragment,
                item.node
            );

            // render styles
            doc.querySelectorAll("style")
            .forEach(oldStyle =>
            {
                const style =
                    document.createElement("style");

                style.textContent =
                    oldStyle.textContent;

                document.head.appendChild(style);
            });

            // execute scripts
            doc.querySelectorAll("script")
            .forEach(oldScript =>
            {
                const script =
                    document.createElement("script");

                // external script
                if (oldScript.src)
                {
                    script.src =
                        oldScript.src;
                }
                else
                {
                    // inline script
                    script.textContent =
                        oldScript.textContent;
                }

                document.body.appendChild(script);
            });
        }
    }
    catch(err)
    {
        console.error(err);
    }
}

include();
