'use client'

import { withPageAuthRequired } from '@auth0/nextjs-auth0/client'
import { Formik, Form, Field, FieldArray } from 'formik'
import { Button } from '@chakra-ui/react'

type CoreValuesSubmission = {
  values: string[],
}

export default withPageAuthRequired(function Create() {
  async function handleSubmit(input: CoreValuesSubmission) {
    const body = {
      values: input.values,
    }
    await fetch('/api/supabase/values', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
  }

  return (
    <div className="flex flex-col items-center">
      <h1>What are your core values?</h1>
      <Formik
        initialValues={{
          values: [
            '',
            '',
            '',
          ]
        }}
        onSubmit={handleSubmit}
      >
        <Form>
          <FieldArray
            name="values"
            render={arrayHelpers => (
              <div>
                {arrayHelpers.form.values.values.map((val: string, index: number) => (
                  <div key={index} className="m-1">
                    <label className="font-bold">{index + 1}.</label>
                    <Field
                      className="p-2 ml-2 mr-2"
                      name={`values.${index}`}
                      type="text"
                    />
                    <Button
                      colorScheme="lightRed"
                      type="button"
                      size="sm"
                      onClick={() => arrayHelpers.remove(index)}
                    >
                      -
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  size="sm"
                  colorScheme="lightGreen"
                  className="mb-2 mr-1 float-right"
                  onClick={() => arrayHelpers.insert(arrayHelpers.form.values.values.length, '')}
                >
                  +
                </Button>
              </div>
            )}
          ></FieldArray>
          <Button type="submit" colorScheme="lightGreen">Submit</Button>
        </Form>
      </Formik>
    </div>
  )
})
