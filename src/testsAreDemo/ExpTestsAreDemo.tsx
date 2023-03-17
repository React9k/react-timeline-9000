
import React from "react";
import { render, Scenario, ScenarioOptions, tad } from "@famiprog-foundation/tests-are-demo";
import { Main } from "../stories/basic/Basic.stories";

export class ExpTestsAreDemo {

    @Scenario("WHEN something, THEN something else")
    whenSomeTest() {
        render(<Main />)
    }

}