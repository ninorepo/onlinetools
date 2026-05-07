async function include(file, targetSelector)
{
    try
    {
        // fetch partial
        const response =
            await fetch("../asset/include/" + file);

        if (!response.ok)
        {
            throw new Error("Failed to load " + file);
        }

        // get html text
        const html = await response.text();

        // parse html
        const parser = new DOMParser();
        const doc =
            parser.parseFromString(html, "text/html");

        // remove redirect meta
        doc.querySelectorAll(
            'meta[http-equiv="refresh"]'
        ).forEach(el => el.remove());

        // target element
        const target =
            document.querySelector(targetSelector);

        if (!target)
        {
            throw new Error(
                "Target not found: " + targetSelector
            );
        }

        // insert html first
        target.innerHTML = doc.body.innerHTML;

        // render styles
        doc.querySelectorAll("style").forEach(oldStyle =>
        {
            const style =
                document.createElement("style");

            style.textContent =
                oldStyle.textContent;

            document.head.appendChild(style);
        });

        // execute scripts
        doc.querySelectorAll("script").forEach(oldScript =>
        {
            const script =
                document.createElement("script");

            // external script
            if (oldScript.src)
            {
                script.src = oldScript.src;
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
    catch(err)
    {
        console.error(err);
    }
}
